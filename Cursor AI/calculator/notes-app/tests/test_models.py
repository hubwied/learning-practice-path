"""Unit tests for the note model. No file I/O and no Streamlit."""

from datetime import datetime, timezone
from uuid import UUID

import pytest

from models import new_note, note_from_dict, note_to_dict


def test_new_note_fills_generated_fields() -> None:
    note = new_note("  Lista zakupów  ", "mleko", "  dom  ")

    UUID(note.id)
    assert note.title == "Lista zakupów"
    assert note.content == "mleko"
    assert note.category == "dom"
    assert note.is_pinned is False
    assert note.created_at == note.updated_at
    assert note.created_at.tzinfo is not None
    assert note.created_at.utcoffset() == timezone.utc.utcoffset(None)


def test_new_note_rejects_blank_title() -> None:
    with pytest.raises(ValueError, match="Title is required"):
        new_note("   ", "treść jest", "dom")


def test_new_note_keeps_empty_content() -> None:
    note = new_note("Tytuł", "", None)

    assert note.content == ""
    assert note.category is None


def test_round_trip_keeps_polish_characters() -> None:
    note = new_note("Zażółć gęślą jaźń", "C++ / 100%", "łódź")
    restored = note_from_dict(note_to_dict(note))

    assert restored == note


def test_note_from_dict_rejects_naive_timestamps() -> None:
    raw = note_to_dict(new_note("Tytuł", "treść", None))
    raw["created_at"] = "2026-11-20T18:00:00"

    with pytest.raises(ValueError, match="timezone"):
        note_from_dict(raw)
