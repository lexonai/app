"use strict";

(function () {
  const searchInput = document.querySelector(
    "#globalSearchInput"
  );

  const searchForm = document.querySelector(
    "#globalSearchForm"
  );

  function getQuery() {
    const params = new URLSearchParams(
      window.location.search
    );

    return (
      params.get("search") ||
      params.get("query") ||
      ""
    ).trim();
  }

  function saveQuery(query) {
    if (!query) return;

    try {
      const history =
        JSON.parse(
          localStorage.getItem(
            "lexon_search_history"
          ) || "[]"
        );

      const filtered = history.filter(
        (item) =>
          String(item).toLowerCase() !==
          query.toLowerCase()
      );

      filtered.unshift(query);

      localStorage.setItem(
        "lexon_search_history",
        JSON.stringify(filtered.slice(0, 20))
      );
    } catch {}
  }

  function submitSearch(query) {
    const value = String(query || "").trim();

    if (!value) return;

    saveQuery(value);

    // Route to the dedicated smart-search page (multi-language intent
    // matching across videos/guides/tools/prompts/courses), not a single
    // resource type — routing here to tools.html was the bug.
    const onSearchPage =
      window.location.pathname.indexOf("search.html") !== -1;

    const base = onSearchPage
      ? ""
      : (window.location.pathname.indexOf("/pages/") !== -1
          ? "search.html"
          : "pages/search.html");

    const url =
      base +
      (base ? "?" : (window.location.pathname + "?")) +
      "search=" +
      encodeURIComponent(value);

    if (onSearchPage && window.LexonRunSearch) {
      // Already on the search page — update in place instead of reloading.
      history.replaceState(null, "", url);
      window.LexonRunSearch(value);
    } else {
      window.location.href = url;
    }
  }

  function initializeInput() {
    if (!searchInput) return;

    const query = getQuery();

    if (query) {
      searchInput.value = query;
    }
  }

  function initializeForm() {
    if (!searchForm || !searchInput) return;

    searchForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        submitSearch(searchInput.value);
      }
    );
  }

  function getSearchHistory() {
    try {
      const history =
        JSON.parse(
          localStorage.getItem(
            "lexon_search_history"
          ) || "[]"
        );

      return Array.isArray(history)
        ? history
        : [];
    } catch {
      return [];
    }
  }

  function clearSearchHistory() {
    try {
      localStorage.removeItem(
        "lexon_search_history"
      );
    } catch {}
  }

  window.LexonSearch = {
    getQuery,
    submitSearch,
    getSearchHistory,
    clearSearchHistory
  };

  initializeInput();
  initializeForm();
})();