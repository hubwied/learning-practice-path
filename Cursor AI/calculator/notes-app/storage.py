"""Load, save, and query notes stored in a local JSON file."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from models import Note, new_note, note_from_dict, note_to_dict, normalize_category

STORE_VERSION = 1
NOTES_PATH = Path(__file__).resolve().parent / "notes.json"
_TMP_PATH = NOTES_PATH.with_suffix(".json.tmp")


class StorageError(Exception):
    """Raised when notes.json cannot be read or has an unsupported shape."""


def load_store() -> dict:
    """Return the on-disk store, or an empty in-memory store when the file is missing."""
    if not NOTES_PATH.exists():
        return {"version": STORE_VERSION, "notes": []}
    try:
        raw = json.loads(NOTES_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise StorageError("Cannot read notes.json") from exc
    if (
        not isinstance(raw, dict)
        or raw.get("version") != STORE_VERSION
        or not isinstance(raw.get("notes"), list)
    ):
        raise StorageError("Unsupported notes.json format")
    return raw


def save_store(store: dict) -> None:
    """Validate and atomically replace notes.json."""
    if (
        not isinstance(store, dict)
        or store.get("version") != STORE_VERSION
        or not isinstance(store.get("notes"), list)
    ):
        raise StorageError("Refusing to write an invalid store")
    payload = json.dumps(store, ensure_ascii=False, indent=2) + "\n"
    # Write aside and replace so a crash mid-write cannot truncate notes.json.
    _TMP_PATH.write_text(payload, encoding="utf-8")
    _TMP_PATH.replace(NOTES_PATH)


def list_notes() -> list[Note]:
    """Load every note. Disk order is preserved."""
    store = load_store()
    try:
        return [note_from_dict(item) for item in store["notes"]]
    except (TypeError, ValueError) as exc:
        raise StorageError("notes.json contains an invalid note") from exc


def filter_notes(notes: list[Note], query: str, category: str | None) -> list[Note]:
    """Filter in memory and return pinned notes first, then recently updated ones."""
    needle = query.strip().casefold()
    filtered: list[Note] = []
    for note in notes:
        if category is not None and note.category != category:
            continue
        if needle and needle not in note.title.casefold() and needle not in note.content.casefold():
            continue
        filtered.append(note)
    filtered.sort(key=lambda note: (not note.is_pinned, -note.updated_at.timestamp()))
    return filtered


def list_categories(notes: list[Note]) -> list[str]:
    """Return unique non-empty categories in case-insensitive alphabetical order."""
    found = {note.category for note in notes if note.category}
    return sorted(found, key=str.casefold)


def add_note(title: str, content: str, category: str | None) -> Note:
    """Create a note and persist it. The file is created on the first save."""
    note = new_note(title, content, category)
    store = load_store()
    store["notes"].append(note_to_dict(note))
    save_store(store)
    return note


def update_note(note_id: str, title: str, content: str, category: str | None) -> Note:
    """Replace title, content, and category. Pin, id, and created_at stay as they are."""
    cleaned_title = title.strip()
    if not cleaned_title:
        raise ValueError("Title is required")
    cleaned_category = normalize_category(category)
    now = datetime.now(timezone.utc)

    def apply(note: Note) -> Note:
        return Note(
            id=note.id,
            title=cleaned_title,
            content=content,
            category=cleaned_category,
            is_pinned=note.is_pinned,
            created_at=note.created_at,
            updated_at=now,
        )

    return _replace(note_id, apply)


def set_pinned(note_id: str, is_pinned: bool) -> Note:
    """Set the pin flag and refresh updated_at."""
    now = datetime.now(timezone.utc)

    def apply(note: Note) -> Note:
        return Note(
            id=note.id,
            title=note.title,
            content=note.content,
            category=note.category,
            is_pinned=is_pinned,
            created_at=note.created_at,
            updated_at=now,
        )

    return _replace(note_id, apply)


def delete_note(note_id: str) -> bool:
    """Remove a note by id. Missing ids leave the file unchanged."""
    store = load_store()
    kept = [item for item in store["notes"] if not (isinstance(item, dict) and item.get("id") == note_id)]
    if len(kept) == len(store["notes"]):
        return False
    store["notes"] = kept
    save_store(store)
    return True


def _replace(note_id: str, apply) -> Note:
    store = load_store()
    for index, item in enumerate(store["notes"]):
        if not isinstance(item, dict) or item.get("id") != note_id:
            continue
        current = note_from_dict(item)
        updated = apply(current)
        store["notes"][index] = note_to_dict(updated)
        save_store(store)
        return updated
    raise KeyError(note_id)
