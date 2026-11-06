const form = document.getElementById("gateForm");
const input = document.getElementById("password");
const status = document.getElementById("gateStatus");
const submit = form.querySelector("button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submit.disabled = true;
  status.textContent = "Checking…";
  status.dataset.state = "idle";
  try {
    const response = await fetch("/api/demos/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: input.value }),
    });
    if (response.ok) {
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      location.replace(next && next.startsWith("/demos") ? next : "/demos");
      return;
    }
    status.textContent =
      response.status === 429
        ? "Too many attempts. Try again in a few minutes."
        : "That password doesn’t match. Check the one your Omnia team sent.";
    status.dataset.state = "error";
    input.select();
  } catch {
    status.textContent = "Couldn’t reach the workspace. Check your connection.";
    status.dataset.state = "error";
  }
  submit.disabled = false;
});
