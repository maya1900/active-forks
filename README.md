# GitHub Top Forks Viewer

[English](#english) | [中文](#中文)

---

<a id="english"></a>
## English

Tampermonkey script that displays the top 5 forks of a GitHub repository in the sidebar, sorted by stars.

### Features

- Shows top 5 forks below the Languages section in repo sidebar
- Sort by: Stars / Newest / Watchers
- Sort preference persists across sessions
- 5-minute cache to reduce API calls
- Supports GitHub SPA navigation

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click Tampermonkey icon → Create a new script
3. Paste the contents of `github-top-forks.user.js` and save

### Usage

Open any GitHub repository page (e.g. `https://github.com/owner/repo`). The widget appears in the right sidebar under "Languages".

Use the dropdown in the widget header to switch sorting mode.

---

<a id="中文"></a>
## 中文

篡改猴脚本，在 GitHub 仓库页面右侧栏显示该仓库被 fork 后 star 数最多的前 5 个项目。

### 功能

- 在仓库页右侧栏 Languages 下方显示 Top 5 fork
- 支持按 Stars / Newest / Watchers 排序
- 排序偏好跨会话保存
- 5 分钟本地缓存，减少 API 请求
- 兼容 GitHub SPA 导航

### 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击篡改猴图标 → 添加新脚本
3. 粘贴 `github-top-forks.user.js` 的内容并保存

### 使用

打开任意 GitHub 仓库页面（如 `https://github.com/owner/repo`），右侧栏 Languages 下方会自动显示 fork 列表。

点击标题栏右侧下拉菜单可切换排序方式。

---

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
