"""Fixtures that keep storage tests off the real notes.json file."""

from __future__ import annotations

from pathlib import Path

import pytest

import storage


@pytest.fixture
def notes_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Point storage at a temporary JSON file for a single test."""
    path = tmp_path / "notes.json"
    monkeypatch.setattr(storage, "NOTES_PATH", path)
    monkeypatch.setattr(storage, "_TMP_PATH", path.with_suffix(".json.tmp"))
    return path
