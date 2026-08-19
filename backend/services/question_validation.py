"""Shared validation helpers for Daily Challenge questions.

The LLM that generates questions (llama-3.1-8b-instant) is unreliable about
the `answer` field. In practice it returns one of three shapes:

  1. The exact option text            -> fine
  2. The option text with extra       -> fixable by normalization
     whitespace / case / punctuation
  3. A 1-based option INDEX as a     -> NOT fixable by normalization; must be
     string ("1", "2", "3", "4")        resolved to the actual option text

This module centralizes the logic so both question generation (write path)
and the API router (read path) enforce the same invariant:

    After resolution + normalization, the answer MUST equal exactly one
    of the four options. If it does not, the question is invalid and must
    never reach the frontend.
"""

import re


def normalize(text):
    """Normalize answer/option text for comparison.

    - None-safe
    - Strips leading/trailing whitespace
    - Collapses internal whitespace runs (incl. newlines) to a single space
    - Lowercases
    """
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def _option_list(q):
    """Return the four options as a list, tolerating either the DB column
    shape (option1..option4) or the LLM JSON shape (options[])."""
    if isinstance(q, dict):
        opts = q.get("options")
        if isinstance(opts, list) and len(opts) == 4:
            return [o for o in opts]
        return [
            q.get("option1"),
            q.get("option2"),
            q.get("option3"),
            q.get("option4"),
        ]
    # SQLAlchemy model instance
    return [q.option1, q.option2, q.option3, q.option4]


def resolve_answer(q):
    """Resolve a question's `answer` to the actual option text it refers to.

    Returns a tuple (resolved_answer, matched_option, is_valid).

    Resolution order:
      1. Exact match against an option.
      2. 1-based numeric index ("1".."4") -> that option's text.
      3. Normalized match against an option.

    If nothing matches, is_valid is False and resolved_answer is the
    original (unresolved) answer.
    """
    options = _option_list(q)
    raw_answer = q.get("answer") if isinstance(q, dict) else q.answer

    # 1. Exact match
    for opt in options:
        if opt is not None and opt == raw_answer:
            return raw_answer, opt, True

    # 2. 1-based index. The LLM sometimes returns the option position
    # instead of the option text, in any of these shapes:
    #     "1".."4"               numeric index
    #     "A".."D"               letter index
    #     "option1".."option4"   column-name style
    #     "first".."fourth" (+ optional "option")  ordinal-word index
    # Resolve any of them to the actual option text so the stored/served
    # answer always equals an option.
    _ORDINALS = {
        "first": 1, "second": 2, "third": 3, "fourth": 4,
        "1st": 1, "2nd": 2, "3rd": 3, "4th": 4,
    }
    if isinstance(raw_answer, str) and raw_answer.strip():
        token = raw_answer.strip()
        idx = None
        if token.isdigit():
            n = int(token)
            if 1 <= n <= 4:
                idx = n
        elif len(token) == 1 and token.upper() in ("A", "B", "C", "D"):
            idx = ord(token.upper()) - ord("A") + 1
        else:
            m = re.match(r"^option\s*([1-4])$", token, re.IGNORECASE)
            if m:
                idx = int(m.group(1))
            else:
                m = re.match(
                    r"^(first|second|third|fourth|1st|2nd|3rd|4th)\s*(option)?$",
                    token,
                    re.IGNORECASE,
                )
                if m:
                    idx = _ORDINALS[m.group(1).lower()]
        if idx is not None and 1 <= idx <= 4 and options[idx - 1] is not None:
            return options[idx - 1], options[idx - 1], True

    # 3. Normalized match
    norm_answer = normalize(raw_answer)
    for opt in options:
        if opt is not None and normalize(opt) == norm_answer:
            return opt, opt, True

    # No match at all
    return raw_answer, None, False


def is_valid_question(q):
    """True iff the question has exactly 4 non-empty options and the answer
    resolves to exactly one of them."""
    options = _option_list(q)
    if len(options) != 4 or any(o is None or str(o).strip() == "" for o in options):
        return False
    _, _, valid = resolve_answer(q)
    return valid


def trace_question(q):
    """Return a human-readable dev trace of one question for logging."""
    options = _option_list(q)
    raw_answer = q.get("answer") if isinstance(q, dict) else q.answer
    resolved, matched, valid = resolve_answer(q)

    lines = [
        "Question:",
        f"  {q.get('question') if isinstance(q, dict) else q.question}",
        "Options:",
        f"  1) {options[0]}",
        f"  2) {options[1]}",
        f"  3) {options[2]}",
        f"  4) {options[3]}",
        f"Answer: {raw_answer}",
        f"Matched Option: {matched if matched is not None else '(none)'}",
        f"Resolved Answer: {resolved}",
        f"Valid: {valid}",
    ]
    return "\n".join(lines)
