"""Unit tests for JSON storage and note queries. Streamlit is not imported."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

import storage
from models import Note
from storage import (
    StorageError,
    add_note,
    delete_note,
    filter_notes,
    list_notes,
    load_store,
    set_pinned,
    update_note,
)


def _note(
    note_id: str,
    title: str,
    content: str,
    *,
    category: str | None = None,
    is_pinned: bool = False,
    updated_at: datetime | None = None,
) -> Note:
    created_at = datetime(2026, 11, 20, 12, 0, tzinfo=timezone.utc)
    return Note(
        id=note_id,
        title=title,
        content=content,
        category=category,
        is_pinned=is_pinned,
        created_at=created_at,
        updated_at=updated_at or created_at,
    )


def test_missing_file_returns_empty_store_without_creating_it(notes_file: Path) -> None:
    assert notes_file.exists() is False

    assert load_store() == {"version": 1, "notes": []}
    assert list_notes() == []
    assert notes_file.exists() is False


def test_add_note_creates_file_and_persists_fields(notes_file: Path) -> None:
    created = add_note("  Zakupy  ", "mleko", "  dom  ")

    assert notes_file.exists() is True
    assert created.title == "Zakupy"
    assert created.content == "mleko"
    assert created.category == "dom"
    assert created.is_pinned is False
    assert created.created_at == created.updated_at

    stored = json.loads(notes_file.read_text(encoding="utf-8"))
    assert stored["version"] == 1
    raw = stored["notes"][0]
    assert raw["id"] == created.id
    assert raw["title"] == "Zakupy"
    assert raw["content"] == "mleko"
    assert raw["category"] == "dom"
    assert raw["is_pinned"] is False
    assert raw["created_at"] == created.created_at.isoformat()
    assert raw["updated_at"] == created.updated_at.isoformat()
    assert list_notes() == [created]


def test_update_note_refreshes_updated_at_and_keeps_created_at(notes_file: Path) -> None:
    created = add_note("Zakupy", "mleko", "dom")
    original_bytes = notes_file.read_bytes()

    updated = update_note(created.id, "  Zakupy 2  ", "chleb", "   ")

    assert updated.id == created.id
    assert updated.title == "Zakupy 2"
    assert updated.content == "chleb"
    assert updated.category is None
    assert updated.is_pinned is False
    assert updated.created_at == created.created_at
    assert updated.updated_at >= created.updated_at
    assert notes_file.read_bytes() != original_bytes
    assert list_notes() == [updated]


def test_delete_note_removes_only_the_matching_id(notes_file: Path) -> None:
    first = add_note("Zostaje", "a", None)
    second = add_note("Znika", "b", None)

    assert delete_note(second.id) is True
    assert [note.id for note in list_notes()] == [first.id]
    assert delete_note(second.id) is False
    assert [note.id for note in list_notes()] == [first.id]


def test_pinned_notes_stay_above_newer_unpinned_notes() -> None:
    older = datetime(2026, 11, 20, 8, 0, tzinfo=timezone.utc)
    newer = older + timedelta(hours=5)
    pinned_old = _note("pin-old", "Starsza", "archiwum", is_pinned=True, updated_at=older)
    pinned_new = _note("pin-new", "Nowsza przypięta", "ważne", is_pinned=True, updated_at=newer)
    loose = _note("loose", "Najnowsza", "luźna", is_pinned=False, updated_at=newer + timedelta(hours=1))

    ordered = filter_notes([loose, pinned_old, pinned_new], "", None)

    assert [note.id for note in ordered] == ["pin-new", "pin-old", "loose"]


def test_set_pinned_persists_flag_and_sorts_note_first(notes_file: Path) -> None:
    plain = add_note("Zwykła", "treść", None)
    pinned = add_note("Ważna", "na górę", None)

    stored = set_pinned(pinned.id, True)

    assert stored.is_pinned is True
    assert stored.created_at == pinned.created_at
    assert stored.updated_at >= pinned.updated_at
    assert [note.id for note in filter_notes(list_notes(), "", None)] == [pinned.id, plain.id]


def test_search_matches_title_or_content_without_case() -> None:
    notes = [
        _note("1", "Lista zakupów", "mleko", category="dom"),
        _note("2", "Praca", "Raport kwartalny", category="praca"),
    ]

    assert [note.id for note in filter_notes(notes, "  RAPORT  ", None)] == ["2"]
    assert [note.id for note in filter_notes(notes, "lista", None)] == ["1"]
    assert filter_notes(notes, "brak takiej frazy", None) == []


def test_search_matches_polish_and_special_characters() -> None:
    notes = [
        _note("1", "Zażółć gęślą jaźń", "zwykła treść"),
        _note("2", "Rachunek", "C++ / 100%"),
    ]

    assert [note.id for note in filter_notes(notes, "zażółć", None)] == ["1"]
    assert [note.id for note in filter_notes(notes, "GĘŚLĄ", None)] == ["1"]
    assert [note.id for note in filter_notes(notes, "100%", None)] == ["2"]
    assert [note.id for note in filter_notes(notes, "c++", None)] == ["2"]
    assert filter_notes(notes, "jaźń++", None) == []


def test_filter_by_category_is_exact_and_ignores_other_notes() -> None:
    notes = [
        _note("1", "Dom", "okno", category="dom"),
        _note("2", "Biuro", "biurko", category="praca"),
        _note("3", "Luźna", "bez kategorii", category=None),
    ]

    assert [note.id for note in filter_notes(notes, "", "praca")] == ["2"]
    assert [note.id for note in filter_notes(notes, "", None)] == ["1", "2", "3"]
    assert filter_notes(notes, "", "Dom") == []
    assert filter_notes(notes, "biurko", "dom") == []


def test_corrupt_or_empty_file_raises_and_is_left_unchanged(notes_file: Path) -> None:
    notes_file.write_text("{", encoding="utf-8")
    with pytest.raises(StorageError, match="Cannot read notes.json"):
        load_store()
    assert notes_file.read_text(encoding="utf-8") == "{"

    notes_file.write_text("", encoding="utf-8")
    with pytest.raises(StorageError, match="Cannot read notes.json"):
        list_notes()
    assert notes_file.read_text(encoding="utf-8") == ""

    notes_file.write_text(json.dumps({"version": 2, "notes": []}), encoding="utf-8")
    with pytest.raises(StorageError, match="Unsupported notes.json format"):
        add_note("Nie zapisuj", "treść", None)
    assert json.loads(notes_file.read_text(encoding="utf-8"))["version"] == 2


def test_invalid_note_inside_file_is_not_overwritten(notes_file: Path) -> None:
    notes_file.write_text(
        json.dumps({"version": 1, "notes": [{"id": "x"}]}),
        encoding="utf-8",
    )
    original = notes_file.read_text(encoding="utf-8")

    with pytest.raises(StorageError, match="invalid note"):
        list_notes()

    assert notes_file.read_text(encoding="utf-8") == original


def test_blank_title_does_not_create_or_change_the_file(notes_file: Path) -> None:
    with pytest.raises(ValueError, match="Title is required"):
        add_note("   ", "", "dom")
    assert notes_file.exists() is False

    created = add_note("Zostaje", "", None)
    original = notes_file.read_bytes()

    with pytest.raises(ValueError, match="Title is required"):
        update_note(created.id, " \n\t ", "nowa treść", "dom")

    assert notes_file.read_bytes() == original
    assert list_notes() == [created]


def test_empty_content_is_stored(notes_file: Path) -> None:
    created = add_note("Sam tytuł", "", None)

    assert created.content == ""
    assert list_notes()[0].content == ""


def test_update_and_delete_missing_id(notes_file: Path) -> None:
    created = add_note("Jest", "treść", None)
    original = notes_file.read_bytes()

    with pytest.raises(KeyError):
        update_note("brak-id", "Inny", "treść", None)
    with pytest.raises(KeyError):
        set_pinned("brak-id", True)

    assert delete_note("brak-id") is False
    assert notes_file.read_bytes() == original
    assert list_notes() == [created]


def test_real_notes_file_is_not_the_temp_path(notes_file: Path) -> None:
    assert notes_file != Path(__file__).resolve().parents[1] / "notes.json"
    assert storage.NOTES_PATH == notes_file
