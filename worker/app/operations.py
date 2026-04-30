def process_text(operation: str, text: str) -> str:
    if operation == "uppercase":
        return text.upper()
    if operation == "lowercase":
        return text.lower()
    if operation == "reverse":
        return text[::-1]
    if operation == "word_count":
        return str(len([token for token in text.split() if token]))

    raise ValueError(f"Unsupported operation: {operation}")

