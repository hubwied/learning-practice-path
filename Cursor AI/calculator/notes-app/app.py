"""Streamlit UI for local notes. Persistence lives in storage.py."""

from __future__ import annotations

from datetime import datetime

import streamlit as st

from models import Note
from storage import StorageError, add_note, delete_note, filter_notes, list_categories, list_notes, set_pinned, update_note

ALL_CATEGORIES = "Wszystkie"


def init_state() -> None:
    """Ensure session keys exist. This does not read the notes file."""
    st.session_state.setdefault("selected_id", None)
    st.session_state.setdefault("mode", "create")
    st.session_state.setdefault("confirm_delete", False)


def render_sidebar(notes: list[Note]) -> None:
    """Search, category filter, and the selectable note list."""
    with st.sidebar:
        st.header("Notatki")
        if st.button("Nowa notatka", use_container_width=True):
            st.session_state.mode = "create"
            st.session_state.selected_id = None
            st.session_state.confirm_delete = False
            st.rerun()

        query = st.text_input("Szukaj", key="search_query", placeholder="Tytuł lub treść")
        categories = list_categories(notes)
        options = [ALL_CATEGORIES, *categories]
        if st.session_state.get("category_filter", ALL_CATEGORIES) not in options:
            st.session_state.category_filter = ALL_CATEGORIES
        selected_category = st.selectbox("Kategoria", options, key="category_filter")
        category = None if selected_category == ALL_CATEGORIES else selected_category
        visible = filter_notes(notes, query, category)

        st.caption(f"{len(visible)} z {len(notes)}")
        if notes and not visible:
            st.info("Brak notatek pasujących do wyszukiwania lub filtra.")
            return

        for note in visible:
            prefix = "📌 " if note.is_pinned else ""
            label = f"{prefix}{note.title}"
            if st.button(label, key=f"open-{note.id}", use_container_width=True):
                st.session_state.mode = "view"
                st.session_state.selected_id = note.id
                st.session_state.confirm_delete = False
                st.rerun()
            st.caption(_format_dt(note.updated_at))


def render_editor(notes: list[Note]) -> None:
    """Show the create form or the editor for the selected note."""
    if st.session_state.mode == "view" and st.session_state.selected_id:
        match = next((note for note in notes if note.id == st.session_state.selected_id), None)
        if match is None:
            st.info("Ta notatka nie jest już dostępna.")
            st.session_state.selected_id = None
            st.session_state.mode = "create"
            st.session_state.confirm_delete = False
            st.rerun()
        _render_existing(match)
        return

    if not notes:
        st.info("Brak notatek. Dodaj pierwszą poniżej.")
    st.subheader("Nowa notatka")
    _render_fields(note=None)


def main() -> None:
    """Load notes once per rerun and draw the sidebar plus the editor."""
    st.set_page_config(page_title="Notatki", layout="wide")
    init_state()
    st.title("Notatki")
    try:
        notes = list_notes()
    except StorageError as exc:
        st.error(str(exc))
        st.stop()
    render_sidebar(notes)
    render_editor(notes)


def _render_existing(note: Note) -> None:
    st.subheader(note.title)
    meta = f"Utworzono: {_format_dt(note.created_at)} · Edytowano: {_format_dt(note.updated_at)}"
    if note.category:
        meta = f"{note.category} · {meta}"
    st.caption(meta)
    _render_fields(note)

    pin_label = "Odepnij" if note.is_pinned else "Przypnij"
    if st.button(pin_label, key="pin-toggle"):
        set_pinned(note.id, not note.is_pinned)
        st.rerun()

    if st.button("Usuń", key="delete-request"):
        st.session_state.confirm_delete = True
    if st.session_state.confirm_delete:
        st.warning("Usunąć tę notatkę? Tej operacji nie można cofnąć.")
        if st.button("Potwierdź usunięcie", key="delete-confirm"):
            delete_note(note.id)
            st.session_state.selected_id = None
            st.session_state.mode = "create"
            st.session_state.confirm_delete = False
            st.rerun()


def _render_fields(note: Note | None) -> None:
    form_key = "create" if note is None else note.id
    with st.form(key=f"editor-{form_key}"):
        title = st.text_input("Tytuł", value="" if note is None else note.title)
        content = st.text_area("Treść", value="" if note is None else note.content, height=240)
        category = st.text_input("Kategoria", value="" if note is None or note.category is None else note.category)
        submitted = st.form_submit_button("Zapisz")
    if not submitted:
        return
    try:
        if note is None:
            created = add_note(title, content, category)
            st.session_state.mode = "view"
            st.session_state.selected_id = created.id
        else:
            update_note(note.id, title, content, category)
        st.session_state.confirm_delete = False
    except ValueError as exc:
        st.error(_validation_message(exc))
        return
    st.rerun()


def _format_dt(value: datetime) -> str:
    return value.astimezone().strftime("%Y-%m-%d %H:%M")


def _validation_message(exc: ValueError) -> str:
    if str(exc) == "Title is required":
        return "Tytuł jest wymagany."
    return "Nie udało się zapisać notatki."


if __name__ == "__main__":
    main()
