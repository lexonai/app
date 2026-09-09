/* =========================================================================
   LEXON AI — Fixed Avatar System
   =========================================================================
   One user = one fixed avatar (avatar_id, 1-20), assigned once at account
   creation and never changed. This script is the single source of truth
   for showing it — include it (after supabase.js) on any authenticated
   page and it will find every avatar element on that page and fill it
   in consistently, overriding any placeholder letter/icon that was there
   before. Never runs on login/signup screens (they don't include it).
   ========================================================================= */

(function () {
  "use strict";

  var AVATAR_COUNT = 20;
  var AVATAR_BASE_PATH = null; // resolved below based on page depth

  function resolveBasePath() {
    // Pages live either at the root (index.html) or one folder deep
    // (pages/, creator/, business/, admin/) — figure out which so the
    // image path always resolves correctly.
    var depth = window.location.pathname.split("/").filter(Boolean);
    var isRoot = depth.length <= 1 || depth[depth.length - 2] === undefined;
    // Heuristic: if the current script tag path contains "../js/avatar.js"
    // we're one level deep; if "js/avatar.js" we're at the root.
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("avatar.js") !== -1) {
        return src.indexOf("../js/avatar.js") !== -1 ? "../assets/avatars/" : "assets/avatars/";
      }
    }
    return "assets/avatars/";
  }

  function avatarUrl(avatarId) {
    var id = Number(avatarId);
    if (!id || id < 1 || id > AVATAR_COUNT) id = 1;
    var padded = id < 10 ? "0" + id : String(id);
    return AVATAR_BASE_PATH + "avatar-" + padded + ".png";
  }

  function applyToElement(el, url) {
    if (!el) return;
    el.innerHTML = '<img src="' + url + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;">';
  }

  // Every place in the app that shows the current user's avatar uses
  // one of these ids/classes — this is intentionally a broad list so
  // no page is missed and nothing needs page-specific wiring.
  var SELECTORS = [
    "#headerAvatar",
    "#headerAvatarInitial",
    "#profileAvatar",
    "#businessAvatar",
    "#creatorAvatar",
    "#avatarPreview",
    ".header-avatar",
    ".avatar",
    ".profile-avatar",
    ".profile-summary-avatar"
  ];

  function findAvatarElements() {
    var found = [];
    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (found.indexOf(el) === -1) found.push(el);
      });
    });
    return found;
  }

  async function init() {
    AVATAR_BASE_PATH = resolveBasePath();

    var client = window.LexonSupabase && window.LexonSupabase.client();
    if (!client) return;

    var user = await window.LexonSupabase.getCurrentUser();
    if (!user) return; // Not authenticated — no avatar to show (auth screens never call this anyway).

    var result = await client
      .from("profiles")
      .select("avatar_id, name")
      .eq("id", user.id)
      .maybeSingle();

    var profile = result && result.data;
    var url = avatarUrl(profile ? profile.avatar_id : 1);

    findAvatarElements().forEach(function (el) {
      // If an element is actually the small <span id="headerAvatarInitial">
      // nested inside a bigger circular container, target the container
      // instead so the image fills the whole circle correctly.
      var target = el.id === "headerAvatarInitial" ? (el.closest("#headerAvatar") || el.parentElement) : el;
      applyToElement(target, url);
    });
  }

  window.LexonAvatar = {
    urlFor: function (avatarId) {
      if (!AVATAR_BASE_PATH) AVATAR_BASE_PATH = resolveBasePath();
      return avatarUrl(avatarId);
    },
    refresh: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
