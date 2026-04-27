# first-TUI

A fuzzy-finder file manager for the terminal, built with React + Ink. Type to search, navigate with your keyboard, and preview files without leaving the terminal.

---

## Requirements

- Node.js 18 or higher
- A Unix terminal (Linux / macOS)
- `$EDITOR` set in your shell (falls back to `vi`)

---

## Installation

```bash
git clone <your-repo-url>
cd first-TUI
npm install
```

---

## Usage

Launch from any directory — the app searches files relative to where you run it from.

```bash
npm start
```

To search a specific directory:

```bash
cd ~/projects/my-app && npm start
```

---

## Interface

```
┌──────────────────────────────────────────────────────┐
│  > src/comp                         12 / 47 files    │
├───────────────────────────┬──────────────────────────┤
│> src/components/App.tsx   │  App.tsx                 │
│  src/components/Nav.tsx   │  ─────────────────────── │
│  src/components/List.tsx  │  1  import React from    │
│  src/compile/index.ts     │  2  'react'              │
│  src/context/app.ts       │  3                       │
│                           │  4  export function ...  │
├───────────────────────────┴──────────────────────────┤
│  ~/projects/my-app/src/components/App.tsx            │
│  ↑/↓ navigate  enter open  ctrl+r rename  ...        │
└──────────────────────────────────────────────────────┘
```

| Area | Description |
|---|---|
| Top bar | Search input and match count |
| Left pane | Fuzzy-matched file list |
| Right pane | Live preview of the selected file |
| Bottom bar | Current path and keyboard hints |

---

## Keyboard Shortcuts

### Searching & Navigation

| Key | Action |
|---|---|
| Type anything | Filter files by fuzzy match |
| `↑` / `↓` | Move selection up / down |
| `k` / `j` | Move selection up / down (vim-style) |
| `q` | Quit (only when search box is empty) |

### File Operations

| Key | Action |
|---|---|
| `Enter` | Open selected file in `$EDITOR` |
| `ctrl+r` | Rename selected file or folder |
| `ctrl+y` | Copy selected file or folder to a directory |
| `ctrl+m` | Move selected file or folder to a directory |
| `Esc` | Cancel the current operation |

### Using the operation prompts

When you press `ctrl+r`, `ctrl+y`, or `ctrl+m`, a modal appears at the center of the screen.

- **Rename** → type the new filename (just the name, not the full path)
- **Copy / Move** → type the full destination directory path (e.g. `/home/user/backup`)
- Press `Enter` to confirm or `Esc` to cancel

---

## Preview Pane

The right pane automatically shows a preview based on the selected file type:

| File type | Preview shown |
|---|---|
| Source code / text | First 40 lines with line numbers |
| Directory | Item count, total size, and a sub-listing |
| Image (jpg, png, gif, webp, bmp) | ASCII art render |
| Binary / unknown | File metadata (size, permissions, MIME type, dates) |

---

## Git Integration

When run inside a git repository, the app shows status markers next to files in the results list:

| Marker | Meaning |
|---|---|
| `M` | Modified |
| `A` | Added (staged) |
| `?` | Untracked |
| `D` | Deleted |

Markers refresh automatically after every rename, copy, or move operation.

---

## Running Tests

```bash
npm test
```

The test suite covers formatters, the git status parser, and file operations (rename, copy, move) using real temporary files.

---

## Project Structure

```
src/
├── index.tsx               # Entry point
├── App.tsx                 # Root state and keyboard routing
├── types.ts                # Shared TypeScript types
├── components/
│   ├── SearchBar.tsx       # Fuzzy search input
│   ├── ResultsList.tsx     # Scrollable results with git markers
│   ├── PreviewPanel.tsx    # File / dir / image / metadata preview
│   ├── StatusBar.tsx       # Path and keybinding hints
│   └── OpModal.tsx         # Rename / copy / move overlay
├── hooks/
│   ├── useFileTree.ts      # Recursive directory walker
│   ├── useFuzzySearch.ts   # fuzzysort wrapper
│   ├── useGitStatus.ts     # git status parser
│   └── usePreview.ts       # Debounced preview loader
└── lib/
    ├── fileOps.ts          # open, rename, copy, move
    ├── imageToAscii.ts     # Image → ASCII art (via jimp)
    └── formatters.ts       # Size, date, permissions, MIME
```

---

## Built With

- [Ink](https://github.com/vadimdemedes/ink) — React renderer for the terminal
- [fuzzysort](https://github.com/farzher/fuzzysort) — Fast fuzzy search
- [jimp](https://github.com/jimp-dev/jimp) — Image processing for ASCII preview
- [fs-extra](https://github.com/jprichardson/node-fs-extra) — Enhanced file operations
