import re
from typing import Callable, List

# --- Rule functions ---
def has_too_many_tags(text: str) -> bool:
    return (len(re.findall(r"#\w+", text)) + len(re.findall(r"\$\w+", text))) > 3

def contains_rocket(text: str) -> bool:
    return "🚀" in text

def has_short_word_count(text: str) -> bool:
    return len(text.split()) < 3

def contains_tco_link(text: str) -> bool:
    return "t.co" in text.lower()

def contains_telegram_link(text: str) -> bool:
    return re.search(r"(t\.me/|telegram\.me/)", text.lower()) is not None


# --- Filter engine ---
FILTER_RULES: List[Callable[[str], bool]] = [
    has_too_many_tags,
    contains_rocket,
    has_short_word_count,
    contains_tco_link,
    contains_telegram_link,
]

def is_relevant_tweet(tweet_text: str) -> bool:
    return not any(rule(tweet_text) for rule in FILTER_RULES)
