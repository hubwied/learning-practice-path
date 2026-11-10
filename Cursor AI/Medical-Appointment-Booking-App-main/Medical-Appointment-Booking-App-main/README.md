# Medical Appointment Booking App

Autor: Rafał Podraza

Medical Appointment Booking App to przykładowa aplikacja React + TypeScript + Vite do rezerwacji wizyt lekarskich. Projekt został przygotowany jako materiał szkoleniowy do pracy z GitHub Copilotem przy analizie kodu, dokumentowaniu, code review, debugowaniu, refaktoryzacji i migracji starszego kodu.

## Funkcje

- przegladanie listy lekarzy,
- przegladanie dostepnych uslug medycznych,
- rezerwacja nowej wizyty,
- zapis wizyt w `localStorage`,
- wyswietlanie listy wizyt,
- filtrowanie wizyt po statusie,
- wyszukiwanie wizyt po pacjencie, lekarzu lub usludze,
- anulowanie wizyt,
- dashboard z podstawowymi statystykami.

## Technologie

- React
- TypeScript
- Vite
- React Hooks
- localStorage
- CSS

Projekt nie wykorzystuje backendu, Redux, Firebase ani bibliotek UI.

## Uruchomienie

Zainstaluj zaleznosci:

```bash
npm install
```

Uruchom aplikacje w trybie developerskim:

```bash
npm run dev
```

Zbuduj wersje produkcyjna:

```bash
npm run build
```

## Struktura projektu

```text
src/
├── components/
├── data/
├── hooks/
├── pages/
├── services/
├── types/
├── utils/
├── App.tsx
├── main.tsx
└── styles.css
```

## Dane aplikacji

Aplikacja zawiera przykładowe dane:

- minimum 8 lekarzy,
- minimum 5 uslug medycznych,
- minimum 10 przykładowych wizyt.

Dane wizyt sa przechowywane w przegladarce za pomoca `localStorage`.

## Material szkoleniowy

Projekt celowo zawiera miejsca przydatne do cwiczen z GitHub Copilot:

- duzy komponent `AppointmentManager.tsx`,
- powtarzajaca sie logike filtrowania,
- slabe nazwy zmiennych,
- brak szczegolowej dokumentacji komponentow,
- celowy blad do debugowania przy usuwaniu anulowanej wizyty,
- miejsca nadajace sie do code review, refaktoryzacji i poprawy separacji odpowiedzialnosci.
