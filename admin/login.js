(() => {
  const form = document.querySelector("#login-form");
  const status = document.querySelector("#login-status");
  const button = form.querySelector("button");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    status.dataset.state = "";
    status.textContent = "";
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: new FormData(form).get("password"),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true)
        throw new Error(result?.error || "That password is not correct.");
      location.href = "/admin";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = error.message;
      button.disabled = false;
    }
  });
})();
