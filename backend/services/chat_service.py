import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from fastapi import HTTPException
from langchain.schema import HumanMessage
from langchain.memory import ConversationBufferMemory
from fastapi.responses import StreamingResponse
from langchain.callbacks.base import BaseCallbackHandler
from typing import AsyncGenerator, Any
from queue import Queue
import json
import asyncio
from .vector_store import VectorStoreService

class StreamingCallbackHandler(BaseCallbackHandler):
    
    def __init__(self):
        self.tokens = asyncio.Queue()
        
    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        await self.tokens.put(token)

class ChatService:
    def __init__(self):
        if not os.getenv('OPENAI_API_KEY'):
            raise ValueError("OPENAI_API_KEY nie został ustawiony")
        
        self.chat_histories: dict[str, BaseChatMessageHistory] = {}
        self.vector_store = VectorStoreService()
        
        self.template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. You answer questions to the best of your ability. "
                    "Below is context that may be helpful in your response:\n\n"
                    "{context}\n\n" 
                    "Use the context above to provide the best possible answer."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
        ])

    def get_chat_history(self, session_id: str) -> BaseChatMessageHistory:
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = ChatMessageHistory()

        return self.chat_histories[session_id]

    async def process_stream(
        self, 
        callback_handler: StreamingCallbackHandler,
        response_task: asyncio.Task,
    ) -> AsyncGenerator[str, None]:
        try:
            while True:
                if response_task.done():
                    break

                try:
                    token = await asyncio.wait_for(callback_handler.tokens.get(), timeout=0.1)
                    yield f"data: {json.dumps({'token': token})}\n\n"
                except asyncio.TimeoutError:
                    continue
                except asyncio.CancelledError:
                    break

            while not callback_handler.tokens.empty():
                token = await callback_handler.tokens.get()
                yield f"data: {json.dumps({'token': token})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
            if not response_task.done():
                response_task.cancel()

    async def generate_response(self, message: str, session_id: str) -> AsyncGenerator[str, None]:
        callback_handler = StreamingCallbackHandler()
        chat = ChatOpenAI(
            streaming=True,
            callbacks=[callback_handler],
            temperature=0.7,
            model="gpt-4o",
        )

        try:
            relevant_chunks = await self.vector_store.find_relevant_context(message)
            context = "\n\n".join(relevant_chunks)
            
            chat_history = self.get_chat_history(session_id)
            chain = self.template | chat
            
            messages = [
                *chat_history.messages,
                HumanMessage(content=message)
            ]
            
            response_task = asyncio.create_task(
                chat.agenerate([
                    self.template.format_messages(
                        context=context,
                        chat_history=chat_history.messages,
                        input=message
                    )
                ])
            )
            
            async for chunk in self.process_stream(callback_handler, response_task):
                yield chunk

            response = await response_task
            if response.generations:
                ai_message = response.generations[0][0].text
                chat_history.add_user_message(message)
                chat_history.add_ai_message(ai_message)

        except Exception as e:
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"

chat_service = ChatService()