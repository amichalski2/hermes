import dspy


class ConvertToTweet(dspy.Signature):
    """Convert a note to a Twitter/X-style like diary. With following rules:
    1. Avoid Hashtags
    2. Use first-person perspective
    3. Use Emojis"""
    
    note = dspy.InputField()
    tweet = dspy.OutputField(desc="The note converted to a Twitter/X-style like diary")

class ExtractTitle(dspy.Signature):
    """Extract a title from the tweet."""
    
    text = dspy.InputField()
    title = dspy.OutputField()
