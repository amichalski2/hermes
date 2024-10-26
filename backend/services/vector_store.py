import chromadb
from chromadb.config import Settings
from typing import List, Optional
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from semantic_router.encoders import OpenAIEncoder
from semantic_chunkers import StatisticalChunker
import os

class VectorStoreService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.vector_store = Chroma(
            persist_directory="chroma_db",
            embedding_function=self.embeddings
        )
        
        self.encoder = OpenAIEncoder(name="text-embedding-3-small")
        self.chunker = StatisticalChunker(encoder=self.encoder,)
        
    async def add_text(self, text: str, metadata: Optional[dict] = None) -> None:
        if metadata is None:
            metadata = {}
            
        chunks = [str(chunk) for chunk in self.chunker(docs=[text])]
        metadatas = [metadata] * len(chunks)
        
        self.vector_store.add_texts(
            texts=chunks,
            metadatas=metadatas
        )
    async def find_relevant_context(self, query: str, k: int = 3) -> List[str]:
        documents = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in documents]

    def delete_by_metadata(self, metadata_filter: dict) -> None:
        self.vector_store._collection.delete(
            where=metadata_filter
        )