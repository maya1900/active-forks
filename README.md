# GitHub Top Forks Viewer

Tampermonkey script that displays the top 5 forks of a GitHub repository in the sidebar, sorted by stars.

## Features

- Shows top 5 forks below the Languages section in repo sidebar
- Sort by: Stars / Newest / Watchers
- Sort preference persists across sessions
- 5-minute cache to reduce API calls
- Supports GitHub SPA navigation

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click Tampermonkey icon → Create a new script
3. Paste the contents of `github-top-forks.user.js` and save

## Usage

Open any GitHub repository page (e.g. `https://github.com/owner/repo`). The widget appears in the right sidebar under "Languages".

Use the dropdown in the widget header to switch sorting mode.

## Screenshot

```
┌─ Top Forks ────── [Stars ▾] ─┐
│ 🔵 user-a              ★ 128 │
│ 🔵 user-b               ★ 64 │
│ 🔵 user-c               ★ 32 │
│ 🔵 user-d               ★ 16 │
│ 🔵 user-e                ★ 8 │
└───────────────────────────────┘
```

## License

MIT
