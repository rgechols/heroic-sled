/*
  Fast Search — adapted from Craig Mod's implementation
  https://gist.github.com/cmod/5410eae147e4318164258742dd053993
  MIT License — Copyright 2020 Craig Mod
*/
const DEFAULT_CONFIG = {
  shortcuts: {
    open: { key: '/', metaKey: true, altKey: false, ctrlKey: false, shiftKey: false }
  },
  search: {
    minChars: 2,
    maxResults: 8,
    fields: { title: true, description: true, section: true }
  }
};

function initSearch(userConfig = {}) {
  const CONFIG = mergeConfigs(DEFAULT_CONFIG, userConfig);
  const fastSearch = document.getElementById('fastSearch');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  let searchIndex = null;
  let searchVisible = false;
  let resultsAvailable = false;
  let firstRun = true;

  async function loadSearchIndex() {
    try {
      const response = await fetch('/index.json');
      if (!response.ok) throw new Error('Failed to load search index');
      const data = await response.json();
      searchIndex = data.map(item => ({
        ...item,
        searchableTitle: item.title?.toLowerCase() || '',
        searchableDesc: item.desc?.toLowerCase() || '',
        searchableSection: item.section?.toLowerCase() || ''
      }));
      if (searchInput.value) performSearch(searchInput.value);
    } catch (error) {
      console.error('Error loading search index:', error);
      searchResults.innerHTML = '<li class="search-message">Error loading search index...</li>';
    }
  }

  function simpleFuzzyMatch(text, term) {
    if (text.includes(term)) return true;
    if (term.length < 3) return false;
    let matches = 0;
    let lastMatchIndex = -1;
    for (let i = 0; i < term.length; i++) {
      const found = text.indexOf(term[i], lastMatchIndex + 1);
      if (found > -1) { matches++; lastMatchIndex = found; }
    }
    return matches === term.length;
  }

  function matchesShortcut(event, shortcutConfig) {
    return event.key === shortcutConfig.key &&
           event.metaKey === shortcutConfig.metaKey &&
           event.altKey === shortcutConfig.altKey &&
           event.ctrlKey === shortcutConfig.ctrlKey &&
           event.shiftKey === shortcutConfig.shiftKey;
  }

  document.addEventListener('keydown', (event) => {
    if (matchesShortcut(event, CONFIG.shortcuts.open)) {
      event.preventDefault();
      searchVisible = !searchVisible;
      fastSearch.style.visibility = searchVisible ? 'visible' : 'hidden';
      if (searchVisible) {
        if (firstRun) { loadSearchIndex(); firstRun = false; }
        searchInput.focus();
        searchInput.value = '';
      } else {
        searchInput.blur();
        searchResults.innerHTML = '';
      }
    }

    if (event.key === 'Escape' && searchVisible) {
      fastSearch.style.visibility = 'hidden';
      searchInput.blur();
      searchInput.value = '';
      searchResults.innerHTML = '';
      searchVisible = false;
    }

    if (event.key === 'Enter' && searchVisible) {
      const firstResult = searchResults.querySelector('a');
      if (firstResult) { event.preventDefault(); window.location.href = firstResult.href; }
    }

    if (searchVisible && resultsAvailable) {
      const links = Array.from(searchResults.getElementsByTagName('a'));
      if (!links.length) return;
      const active = document.activeElement;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (active === searchInput) { links[0].focus(); }
        else if (active.tagName === 'A') {
          const i = links.indexOf(active);
          if (i !== -1 && i < links.length - 1) links[i + 1].focus();
        }
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (active === links[0]) { searchInput.focus(); }
        else if (active.tagName === 'A') {
          const i = links.indexOf(active);
          if (i > 0) links[i - 1].focus();
          else searchInput.focus();
        }
      }
    }
  });

  function performSearch(term) {
    term = term.toLowerCase().trim();
    if (!term || !searchIndex) { searchResults.innerHTML = ''; resultsAvailable = false; return; }
    if (term.length < CONFIG.search.minChars) {
      searchResults.innerHTML = '<li class="search-message">Keep typing...</li>';
      resultsAvailable = false;
      return;
    }
    const searchTerms = term.split(/\s+/).filter(t => t.length > 0);
    const results = searchIndex
      .map(item => {
        let score = 0;
        const matchesAllTerms = searchTerms.every(t => {
          let matched = false;
          if (CONFIG.search.fields.title) {
            if (item.searchableTitle.startsWith(t)) { score += 3; matched = true; }
            else if (simpleFuzzyMatch(item.searchableTitle, t)) { score += 2; matched = true; }
          }
          if (!matched) {
            if (CONFIG.search.fields.description && item.searchableDesc.includes(t)) { score += 0.5; matched = true; }
            if (CONFIG.search.fields.section && item.searchableSection.includes(t)) { score += 0.5; matched = true; }
          }
          return matched;
        });
        return { item, score: matchesAllTerms ? score : 0 };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, CONFIG.search.maxResults)
      .map(r => r.item);

    resultsAvailable = results.length > 0;
    if (!resultsAvailable) {
      searchResults.innerHTML = '<li class="search-message">No results found.</li>';
      return;
    }
    searchResults.innerHTML = results.map(item => `
      <li>
        <a href="${escapeHtml(item.permalink)}" tabindex="0">
          <span class="title">${escapeHtml(item.title || 'Micro post')}</span>
          <span class="meta">${escapeHtml(item.section)} · ${escapeHtml(item.date)}</span>
        </a>
      </li>
    `).join('');
  }

  searchInput.addEventListener('input', function() {
    if (!searchIndex && !firstRun) {
      searchResults.innerHTML = '<li class="search-message">Loading...</li>';
      return;
    }
    performSearch(this.value);
  });
}

function mergeConfigs(defaultConfig, userConfig) {
  const merged = { ...defaultConfig };
  for (const [key, value] of Object.entries(userConfig)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = mergeConfigs(defaultConfig[key] || {}, value);
    } else { merged[key] = value; }
  }
  return merged;
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

initSearch();
