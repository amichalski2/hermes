from datetime import datetime, date
import os
from typing import Tuple
from openai import OpenAI
from .vector_store import VectorStoreService

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
vector_store = VectorStoreService()

def create_research_entry(content: str) -> str:
    prompt = """
    Convert the following text into a research diary entry format. The entry should:
    1. Use formal, academic language
    2. Avoid personal emotions or casual language
    3. Be structured and concise
    4. Don't add Date, Title or References, write only the content
    
    Text to convert:
    {content}
    """.format(content=content)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a research diary assistant that helps format entries in an academic style."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )
    
    return response.choices[0].message.content

def extract_title(content: str) -> str:
    prompt = """
    Create a formal title for the following research diary entry. The title should:
    1. Use technical/academic language where appropriate
    2. Be concise but informative
    3. Follow scientific naming conventions
    
    Research entry:
    {content}
    """.format(content=content)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an assistant that creates formal titles for research diary entries."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )
    
    return response.choices[0].message.content.strip()

async def process_note(content: str, raw: bool = False) -> Tuple[str, str, date]:
    current_date = datetime.now().date()
    
    if not raw:
        processed_content = create_research_entry(content)
    else:
        processed_content = content
        
    title = extract_title(processed_content)
    
    return processed_content, title, current_date

async def process_raw_note(content: str) -> Tuple[str, str, date]:
    return await process_note(content, raw=True)

async def add_note_to_vector_store(content: str, note_id: int, title: str, date: date) -> None:
    await vector_store.add_text(
        content,
        metadata={
            "note_id": note_id,
            "title": title,
            "date": str(date)
        }
    )

async def delete_note_from_vector_store(note_id: int) -> None:
    vector_store.delete_by_metadata({"note_id": note_id})