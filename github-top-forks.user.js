// ==UserScript==
// @name         GitHub Top Forks Viewer
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Display top 5 most starred forks in the sidebar of GitHub repository pages
// @author       maya1900
// @match        https://github.com/*/*
// @grant        GM_xmlhttpRequest
// @connect      api.github.com
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'github_top_forks_cache';
  const SORT_KEY = 'github_top_forks_sort';
  const CACHE_TTL = 5 * 60 * 1000;

  const SORT_OPTIONS = [
    { value: 'stargazers', label: 'Stars' },
    { value: 'newest', label: 'Newest' },
    { value: 'watchers', label: 'Watchers' },
  ];

  function getRepoInfo() {
    const path = location.pathname.slice(1).split('/');
    if (path.length < 2) return null;
    return { owner: path[0], repo: path[1] };
  }

  function getSort() {
    return localStorage.getItem(SORT_KEY) || 'stargazers';
  }

  function setSort(sort) {
    localStorage.setItem(SORT_KEY, sort);
  }

  function getCacheKey(owner, repo, sort) {
    return `${owner}/${repo}:${sort}`;
  }

  function getCached(key) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const entry = data[key];
      if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.forks;
    } catch { }
    return null;
  }

  function setCache(key, forks) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      data[key] = { forks, ts: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { }
  }

  function fetchTopForks(owner, repo, sort) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `https://api.github.com/repos/${owner}/${repo}/forks?sort=${sort}&per_page=5`,
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        onload(resp) {
          if (resp.status !== 200) return reject(new Error(`HTTP ${resp.status}`));
          const forks = JSON.parse(resp.responseText).map(f => ({
            full_name: f.full_name,
            html_url: f.html_url,
            stargazers_count: f.stargazers_count,
            pushed_at: f.pushed_at,
            owner: f.owner.login,
            avatar_url: f.owner.avatar_url,
          }));
          resolve(forks);
        },
        onerror: reject,
      });
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function findInsertTarget() {
    // Strategy 1: find h2 containing "Languages" in common GitHub sidebar patterns
    const selectors = [
      '.BorderGrid-row h2',
      '.Layout-sidebar h2',
      '.Layout-sidebar h3',
      '[class*="sidebar"] h2',
      '[class*="sidebar"] h3',
      'h2', 'h3',
    ];
    for (const sel of selectors) {
      for (const h of document.querySelectorAll(sel)) {
        if (h.textContent.trim() === 'Languages') {
          return h.closest('[class*="row"]') || h.closest('[class*="cell"]') || h.parentElement;
        }
      }
    }
    // Strategy 2: XPath — find any heading with text "Languages"
    const xpath = document.evaluate(
      '//h2[contains(text(),"Languages")] | //h3[contains(text(),"Languages")]',
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    );
    if (xpath.singleNodeValue) {
      const h = xpath.singleNodeValue;
      return h.closest('[class*="row"]') || h.closest('[class*="cell"]') || h.parentElement;
    }
    return null;
  }

  function renderForks(forks, sort) {
    const existing = document.getElementById('top-forks-widget');
    if (existing) existing.remove();

    const langSection = findInsertTarget();
    if (!langSection) return;

    const row = document.createElement('div');
    row.className = 'BorderGrid-row';
    row.id = 'top-forks-widget';

    const cell = document.createElement('div');
    cell.className = 'BorderGrid-cell';

    // Header with sort selector
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '8px';
    header.style.marginBottom = '8px';

    const h2 = document.createElement('h2');
    h2.className = 'h4 mb-0';
    h2.textContent = 'Top Forks';
    header.appendChild(h2);

    const select = document.createElement('select');
    select.style.marginLeft = 'auto';
    select.style.fontSize = '12px';
    select.style.padding = '2px 4px';
    select.style.borderRadius = '6px';
    select.style.border = '1px solid var(--borderColor-default)';
    select.style.background = 'var(--bgColor-default)';
    select.style.color = 'var(--fgColor-default)';
    select.style.cursor = 'pointer';
    for (const opt of SORT_OPTIONS) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === sort) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', async () => {
      const newSort = select.value;
      setSort(newSort);
      const info = getRepoInfo();
      if (!info) return;
      const cacheKey = getCacheKey(info.owner, info.repo, newSort);
      let data = getCached(cacheKey);
      if (!data) {
        data = await fetchTopForks(info.owner, info.repo, newSort);
        setCache(cacheKey, data);
      }
      renderForks(data, newSort);
    });
    header.appendChild(select);

    cell.appendChild(header);

    // Fork list
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';

    if (forks.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'color-fg-muted';
      empty.textContent = 'No forks found.';
      list.appendChild(empty);
    } else {
      for (const fork of forks) {
        const item = document.createElement('a');
        item.href = fork.html_url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';
        item.style.textDecoration = 'none';
        item.style.color = 'inherit';
        item.style.padding = '4px 0';

        const avatar = document.createElement('img');
        avatar.src = fork.avatar_url;
        avatar.alt = fork.owner;
        avatar.width = 20;
        avatar.height = 20;
        avatar.style.borderRadius = '50%';
        avatar.style.flexShrink = '0';

        const name = document.createElement('span');
        name.style.fontSize = '12px';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.whiteSpace = 'nowrap';
        name.textContent = fork.owner;

        const meta = document.createElement('span');
        meta.style.marginLeft = 'auto';
        meta.style.fontSize = '11px';
        meta.style.color = 'var(--color-fg-muted)';
        meta.style.whiteSpace = 'nowrap';
        meta.style.display = 'flex';
        meta.style.alignItems = 'center';
        meta.style.gap = '2px';

        if (sort === 'newest') {
          meta.textContent = formatDate(fork.pushed_at);
        } else {
          meta.innerHTML = `<svg aria-label="stars" width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-1px"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg> ${fork.stargazers_count}`;
        }

        item.append(avatar, name, meta);
        list.appendChild(item);
      }
    }

    cell.appendChild(list);
    row.appendChild(cell);
    langSection.parentNode.insertBefore(row, langSection.nextSibling);
  }

  async function init() {
    const info = getRepoInfo();
    if (!info) return;
    if (location.pathname.endsWith('/forks')) return;

    const sort = getSort();
    const cacheKey = getCacheKey(info.owner, info.repo, sort);
    let data = getCached(cacheKey);
    if (!data) {
      data = await fetchTopForks(info.owner, info.repo, sort);
      setCache(cacheKey, data);
    }
    renderForks(data, sort);
  }

  init();
  const observer = new MutationObserver(() => {
    if (!document.getElementById('top-forks-widget')) init();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
