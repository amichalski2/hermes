from datetime import datetime, date
import os
from typing import Tuple
import dspy
from signatures import ConvertToTweet, ExtractTitle

lm = dspy.LM('openai/gpt-4o-mini', api_key=os.getenv('OPENAI_API_KEY'))
dspy.configure(lm=lm)
convert_to_tweet = dspy.Predict(ConvertToTweet)
create_title = dspy.Predict(ExtractTitle)

def preprocess_content(content: str) -> str:
    result = convert_to_tweet(note=content)
    return result.tweet

def extract_title(content: str) -> str:
    result = create_title(text=content)
    return result.title

def process_note(content: str) -> Tuple[str, str, date]:
    processed_content = preprocess_content(content)
    title = extract_title(processed_content)
    current_date = datetime.now().date()
    return processed_content, title, current_date

def process_raw_note(content: str) -> Tuple[str, str, date]:
    title = extract_title(content)
    current_date = datetime.now().date()
    return content, title, current_date
