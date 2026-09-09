const PromptsPage = (() => {
  const supabase = window.LexonSupabase?.client();

  const state = {
    prompts: [],
    filtered: [],
    query: "",
    category: "all"
  };

  const elements = {
    grid: document.querySelector("#promptsGrid"),
    search: document.querySelector("#promptSearch"),
    filters: document.querySelector("#promptFilters"),
    loading: document.querySelector("#promptsLoading"),
    empty: document.querySelector("#promptsEmpty"),
    error: document.querySelector("#promptsError"),
    count: document.querySelector("#promptsCount")
  };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getTitle(prompt) {
    return prompt.title || prompt.name || "Untitled prompt";
  }

  function getPromptText(prompt) {
    return prompt.prompt ||
      prompt.content ||
      prompt.prompt_text ||
      "";
  }

  function getDescription(prompt) {
    return prompt.description || "Useful prompt for an AI workflow.";
  }

  function getCategory(prompt) {
    return prompt.category || prompt.topic || "AI";
  }

  function getLevel(prompt) {
    return prompt.level || prompt.experience || "";
  }

  function getPricing(prompt) {
    return prompt.pricing || prompt.price_type || (
      prompt.is_free === true ? "Free" :
      prompt.is_free === false ? "Paid" : ""
    );
  }

  function updateCount() {
    if (!elements.count) return;

    const count = state.filtered.length;

    elements.count.textContent =
      `${count} ${count === 1 ? "prompt" : "prompts"}`;
  }

  function setLoading(show) {
    if (elements.loading) {
      elements.loading.hidden = !show;
    }
  }

  function setEmpty(show) {
    if (elements.empty) {
      elements.empty.hidden = !show;
    }
  }

  function setError(show, text = "") {
    if (!elements.error) return;

    elements.error.hidden = !show;

    if (text) {
      elements.error.textContent = text;
    }
  }

  async function copyPrompt(text, button) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      const original = button.innerHTML;

      button.innerHTML = `
        <i data-lucide="check"></i>
        Copied
      `;

      if (window.lucide) {
        lucide.createIcons();
      }

      setTimeout(() => {
        button.innerHTML = original;

        if (window.lucide) {
          lucide.createIcons();
        }
      }, 1400);

    } catch (error) {
      console.error(error);
    }
  }

  function createPromptCard(prompt) {
    const title = escapeHTML(getTitle(prompt));
    const description = escapeHTML(getDescription(prompt));
    const category = escapeHTML(getCategory(prompt));
    const level = escapeHTML(getLevel(prompt));
    const pricing = escapeHTML(getPricing(prompt));
    const promptText = getPromptText(prompt);

    const article = document.createElement("article");
    article.className = "prompt-card";

    const preview = promptText
      ? escapeHTML(promptText)
      : "No prompt text available.";

    article.innerHTML = `
      <div class="prompt-card-header">

        <div class="prompt-card-meta">
          <span>${category}</span>
          ${level ? `<span>${level}</span>` : ""}
          ${pricing ? `<span class="pricing-badge pricing-badge-${pricing.toLowerCase() === "free" ? "free" : "paid"}">${pricing}</span>` : ""}
        </div>

        <div class="prompt-card-icon">
          <i data-lucide="sparkles"></i>
        </div>

      </div>

      <div class="prompt-card-body">
        <h3>${title}</h3>

        <p>${description}</p>

        <div class="prompt-preview">
          ${preview}
        </div>
      </div>

      <div class="prompt-card-footer">
        <button
          type="button"
          class="prompt-copy-button"
          data-copy-prompt
        >
          <i data-lucide="copy"></i>
          Copy prompt
        </button>

        <a
          class="prompt-related-link"
          href="search.html?q=${encodeURIComponent((getCategory(prompt) || getTitle(prompt)))}"
        >
          Related resources
          <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    `;

    const copyButton = article.querySelector("[data-copy-prompt]");

    copyButton.addEventListener("click", () => {
      copyPrompt(promptText, copyButton);
    });

    return article;
  }

  const PAGE_SIZE = 12;

  function render() {
    if (!elements.grid) return;

    elements.grid.innerHTML = "";

    updateCount();

    if (!state.filtered.length) {
      setEmpty(true);
      return;
    }

    setEmpty(false);

    const fragment = document.createDocumentFragment();
    const pageItems = state.filtered.slice(0, state.visibleCount || PAGE_SIZE);

    pageItems.forEach(prompt => {
      fragment.appendChild(createPromptCard(prompt));
    });

    elements.grid.appendChild(fragment);

    const existingLoadMore = document.getElementById("promptsLoadMore");
    if (existingLoadMore) existingLoadMore.remove();

    if (state.filtered.length > pageItems.length) {
      const wrap = document.createElement("div");
      wrap.id = "promptsLoadMore";
      wrap.style.cssText = "grid-column:1/-1;display:flex;justify-content:center;padding:12px 0;";
      wrap.innerHTML = `<button type="button" style="cursor:pointer;">Load more prompts</button>`;
      wrap.querySelector("button").addEventListener("click", () => {
        state.visibleCount = (state.visibleCount || PAGE_SIZE) + PAGE_SIZE;
        render();
      });
      elements.grid.after(wrap);
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function filterPrompts() {
    const query = normalize(state.query);
    const category = normalize(state.category);

    state.filtered = state.prompts.filter(prompt => {
      const searchable = [
        getTitle(prompt),
        getDescription(prompt),
        getPromptText(prompt),
        getCategory(prompt),
        getLevel(prompt),
        prompt.tags,
        prompt.author_name
      ]
        .flat()
        .map(normalize)
        .join(" ");

      const matchesQuery =
        !query || searchable.includes(query);

      const matchesCategory =
        category === "all" ||
        normalize(getCategory(prompt)) === category;

      return matchesQuery && matchesCategory;
    });

    state.visibleCount = PAGE_SIZE;
    render();
  }

  function bindSearch() {
    if (!elements.search) return;

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("search") || "";

    elements.search.value = initialQuery;
    state.query = initialQuery;

    elements.search.addEventListener("input", event => {
      state.query = event.target.value;
      filterPrompts();
    });
  }

  function applyInitialCategoryFromURL() {
    if (!elements.filters) return;

    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (!category) return;

    const button = elements.filters.querySelector(
      `[data-category="${CSS.escape(category)}"]`
    );

    if (!button) return;

    elements.filters
      .querySelectorAll("[data-category]")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    state.category = category;
  }

  function bindFilters() {
    if (!elements.filters) return;

    elements.filters.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");

      if (!button) return;

      elements.filters
        .querySelectorAll("[data-category]")
        .forEach(item => {
          item.classList.remove("active");
        });

      button.classList.add("active");

      state.category =
        button.dataset.category || "all";

      filterPrompts();
    });
  }

  async function loadPrompts() {
    if (!supabase) {
      setLoading(false);
      setError(true, "LEXON AI database is not configured.");
      return;
    }

    setLoading(true);
    setEmpty(false);
    setError(false);

    try {
      // Ranked by automatic popularity score (see
      // supabase/popularity_ranking.sql), capped at 200 rows.
      let result = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "published")
        .order("popularity_score", { ascending: false })
        .limit(200);

      if (result.error && /popularity_score/i.test(result.error.message || "")) {
        result = await supabase
          .from("prompts")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(200);
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      state.prompts = Array.isArray(data) ? data : [];

      filterPrompts();

    } catch (error) {
      console.error(error);

      state.prompts = [];
      state.filtered = [];

      setError(
        true,
        error?.message || "Unable to load prompts right now."
      );

      setEmpty(false);
      updateCount();

    } finally {
      setLoading(false);
    }
  }

  function init() {
    bindSearch();
    bindFilters();
    applyInitialCategoryFromURL();
    loadPrompts();
  }

  return {
    init,
    loadPrompts,
    filterPrompts
  };
})();

window.LexonPrompts = PromptsPage;

document.addEventListener("DOMContentLoaded", () => {
  PromptsPage.init();
});