"""Note model and conversions between objects and JSON-ready dictionaries."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4


@dataclass(frozen=True)
class Note:
    """A single note stored in notes.json."""

    id: str
    title: str
    content: str
    category: str | None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime


def normalize_category(value: str | None) -> str | None:
    """Return a stripped category, or None when the value is blank."""
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    return cleaned


def new_note(title: str, content: str, category: str | None) -> Note:
    """Build a new note with a fresh id and matching created/updated timestamps."""
    cleaned_title = title.strip()
    if not cleaned_title:
        raise ValueError("Title is required")
    now = datetime.now(timezone.utc)
    return Note(
        id=str(uuid4()),
        title=cleaned_title,
        content=content,
        category=normalize_category(category),
        is_pinned=False,
        created_at=now,
        updated_at=now,
    )


def note_to_dict(note: Note) -> dict:
    """Serialize a note to a JSON-ready dictionary."""
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "category": note.category,
        "is_pinned": note.is_pinned,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }


def note_from_dict(raw: dict) -> Note:
    """Build a Note from a dictionary loaded from JSON."""
    if not isinstance(raw, dict):
        raise ValueError("Note must be an object")
    try:
        note_id = raw["id"]
        title = raw["title"]
        content = raw["content"]
        category = raw["category"]
        is_pinned = raw["is_pinned"]
        created_at = datetime.fromisoformat(raw["created_at"])
        updated_at = datetime.fromisoformat(raw["updated_at"])
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError("Note is missing a required field or has an invalid date") from exc
    if not isinstance(note_id, str) or not note_id:
        raise ValueError("Note id must be a non-empty string")
    if not isinstance(title, str) or not title.strip():
        raise ValueError("Note title must be a non-empty string")
    if not isinstance(content, str):
        raise ValueError("Note content must be a string")
    if category is not None and not isinstance(category, str):
        raise ValueError("Note category must be a string or null")
    if not isinstance(is_pinned, bool):
        raise ValueError("Note is_pinned must be a boolean")
    if created_at.tzinfo is None or updated_at.tzinfo is None:
        raise ValueError("Note timestamps must include a timezone")
    return Note(
        id=note_id,
        title=title.strip(),
        content=content,
        category=normalize_category(category),
        is_pinned=is_pinned,
        created_at=created_at.astimezone(timezone.utc),
        updated_at=updated_at.astimezone(timezone.utc),
    )
