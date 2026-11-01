(() => {
  const form = document.querySelector("#inquiry-form");
  const status = document.querySelector("#inquiry-status");
  const button = form.querySelector("button[type=submit]");
  const label = button.querySelector("span");
  const interest = form.querySelector("#interest");
  const message = form.querySelector("#message");
  const messageField = message.closest(".field");
  function syncIntent() {
    const updates = interest.value === "updates";
    message.required = !updates;
    message.disabled = updates;
    messageField.hidden = updates;
    label.textContent = updates ? "Register interest" : "Start a conversation";
  }
  interest.addEventListener("change", syncIntent);
  syncIntent();
  document.querySelectorAll("[data-inquiry-intent]").forEach((control) => {
    control.addEventListener("click", () => {
      interest.value = control.dataset.inquiryIntent;
      syncIntent();
      form.querySelector("#name").focus();
    });
  });
  document.querySelectorAll("[data-idea]").forEach((link) => {
    link.addEventListener("click", () => {
      interest.value = "business";
      syncIntent();
      if (!message.value.trim()) {
        message.value = link.dataset.idea;
        status.textContent =
          "A starting sentence has been added. Make it your own.";
      } else {
        status.textContent =
          "Your draft is already here. Keep going in your own words.";
      }
      status.dataset.state = "draft";
    });
  });
  function markInvalid() {
    for (const field of form.querySelectorAll("input, select, textarea")) {
      if (field.name === "website" || field.disabled) {
        field.removeAttribute("aria-invalid");
        continue;
      }
      field.toggleAttribute("aria-invalid", !field.checkValidity());
    }
  }
  form.addEventListener("input", (event) => {
    const field = event.target;
    if (
      field instanceof HTMLElement &&
      field.matches?.("input, select, textarea") &&
      field.checkValidity()
    )
      field.removeAttribute("aria-invalid");
  });
  let sending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) {
      if (!sending) markInvalid();
      return;
    }
    const payload = Object.fromEntries(new FormData(form));
    sending = true;
    button.disabled = true;
    label.textContent = "Sending…";
    status.textContent = "";
    status.dataset.state = "";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (response.status !== 201 || result?.received !== true || !result.id)
        throw new Error(
          result?.error ||
            "Inquiries are not open on this preview. Nothing has been sent.",
        );
      form.reset();
      syncIntent();
      status.dataset.state = "success";
      status.textContent =
        payload.interest === "updates"
          ? "Your interest is registered. Thank you for following Omnia."
          : "Your idea is with the Omnia team. Thank you for starting the conversation.";
      status.focus();
    } catch (error) {
      status.dataset.state = "error";
      status.textContent =
        error.name === "AbortError"
          ? "We couldn’t confirm receipt. Please try again when your connection is stable."
          : error.name === "TypeError"
            ? "Your connection was interrupted. Please try again. Your details are still here."
            : error.message ||
              "Your inquiry could not be sent. Please try again later.";
      status.focus();
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      syncIntent();
    }
  });
})();
