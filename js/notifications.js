/* =========================================================================
   LEXON AI — Notification Bell (badge + link to full Notification Center)
   =========================================================================
   Finds #notificationButton, shows an unread-count badge on it, and
   clicking it navigates to the full notifications page (pages/notifications.html)
   instead of opening an inline dropdown.
   ========================================================================= */

(function () {
  "use strict";

  function resolveNotificationsPageURL() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("notifications.js") !== -1) {
        return src.indexOf("../js/notifications.js") !== -1 ? "notifications.html" : "pages/notifications.html";
      }
    }
    return "pages/notifications.html";
  }

  function badgeText(count) {
    if (count <= 0) return "";
    if (count > 9) return "9+";
    return String(count);
  }

  function injectStyles() {
    if (document.getElementById("lexonNotificationStyles")) return;
    var style = document.createElement("style");
    style.id = "lexonNotificationStyles";
    style.textContent =
      ".lexon-notif-badge{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#e5484d;color:#fff;font-size:9.5px;font-weight:800;display:none;align-items:center;justify-content:center;line-height:1;}" +
      ".lexon-notif-badge.visible{display:flex;}";
    document.head.appendChild(style);
  }

  async function init() {
    var button = document.getElementById("notificationButton");
    if (!button) return;

    injectStyles();

    var wrapper = button.parentElement;
    if (wrapper && getComputedStyle(wrapper).position === "static") {
      wrapper.style.position = "relative";
    } else if (getComputedStyle(button).position === "static") {
      button.style.position = "relative";
    }

    var badge = document.createElement("span");
    badge.className = "lexon-notif-badge";
    button.appendChild(badge);

    var targetURL = resolveNotificationsPageURL();
    button.addEventListener("click", function () {
      window.location.href = targetURL;
    });

    var client = window.LexonSupabase && window.LexonSupabase.client();
    if (!client) return;

    var user = await window.LexonSupabase.getCurrentUser();
    if (!user) return;

    var notifResult = await client
      .from("notifications")
      .select("id")
      .limit(100);

    var allNotifications = notifResult.data || [];

    var readResult = await client
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id);

    var readIds = new Set((readResult.data || []).map(function (r) { return r.notification_id; }));
    var unread = allNotifications.filter(function (n) { return !readIds.has(n.id); }).length;

    var text = badgeText(unread);
    badge.textContent = text;
    badge.classList.toggle("visible", Boolean(text));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
