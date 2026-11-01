(() => {
  const inbox = document.querySelector("#inquiries"),
    status = document.querySelector("#admin-status");
  const previous = document.querySelector("#previous"),
    next = document.querySelector("#next"),
    refresh = document.querySelector("#refresh");
  let page = 0,
    loading = false;
  const interests = {
    business: "Business inquiry",
    partner: "Potential partner",
    investor: "Investor",
    updates: "Launch interest",
  };
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  async function load() {
    if (loading) return;
    loading = true;
    previous.disabled = next.disabled = refresh.disabled = true;
    status.textContent = "Opening your inbox…";
    try {
      const response = await fetch(`/api/admin/inquiries?page=${page}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        location.href = "/admin/login";
        return;
      }
      if (!response.ok || !Array.isArray(result?.inquiries))
        throw new Error(
          result?.error || "The inbox could not be loaded. Please try again.",
        );
      inbox.replaceChildren();
      for (const item of result.inquiries) {
        const article = element("article", "inquiry");
        article.dataset.reviewed = String(item.status === "reviewed");
        const head = element("div", "inquiry-header"),
          identity = element("div");
        const email = element("a", "", item.email);
        email.href = `mailto:${encodeURIComponent(item.email)}`;
        const date = new Date(item.created_at).toLocaleString();
        identity.append(
          element("h2", "", item.name),
          email,
          element(
            "p",
            "inquiry-meta",
            `${interests[item.interest] || "Inquiry"} · ${date}`,
          ),
        );
        const toggle = element(
          "button",
          "small-cta",
          item.status === "reviewed" ? "Mark as new" : "Mark reviewed",
        );
        toggle.type = "button";
        toggle.addEventListener("click", async () => {
          toggle.disabled = true;
          try {
            const response = await fetch("/api/admin/inquiries", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: item.id,
                status: item.status === "new" ? "reviewed" : "new",
              }),
            });
            if (!response.ok) throw new Error();
            item.status = item.status === "new" ? "reviewed" : "new";
            article.dataset.reviewed = String(item.status === "reviewed");
            toggle.textContent =
              item.status === "reviewed" ? "Mark as new" : "Mark reviewed";
          } catch {
            status.textContent = "That status was not saved. Please try again.";
          } finally {
            toggle.disabled = false;
          }
        });
        head.append(identity, toggle);
        article.append(head, element("p", "inquiry-message", item.message));
        inbox.append(article);
      }
      status.textContent = result.inquiries.length
        ? ""
        : "Your inbox is empty. New inquiries will appear here.";
      previous.disabled = page === 0;
      next.disabled = !result.hasMore;
      document.querySelector("#page-number").textContent = `Page ${page + 1}`;
    } catch (error) {
      inbox.replaceChildren();
      status.textContent = error.message;
    } finally {
      loading = false;
      refresh.disabled = false;
    }
  }
  previous.addEventListener("click", () => {
    page--;
    load();
  });
  next.addEventListener("click", () => {
    page++;
    load();
  });
  refresh.addEventListener("click", load);
  document.querySelector("#logout").addEventListener("click", async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    location.href = "/admin/login";
  });
  load();
})();
