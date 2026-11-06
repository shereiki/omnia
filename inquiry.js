(() => {
  const form = document.querySelector("#early-access-form");
  if (!form) return;
  const stepOne = form.querySelector(".early-access-step-one");
  const stepTwo = form.querySelector("#early-access-details");
  const email = form.querySelector("#early-email");
  const status = form.querySelector("#early-access-status");
  const detailsStatus = form.querySelector("#early-access-details-status");
  const success = document.querySelector("#early-access-success");
  const stepOneButton = stepOne.querySelector("button[type=submit]");
  const stepOneLabel = stepOneButton.querySelector("span");
  const detailsButton = form.querySelector("[data-details-submit]");
  const detailsLabel = detailsButton.querySelector("span");
  const skip = form.querySelector("[data-details-skip]");
  const fields = {
    company: form.querySelector("#early-company"),
    role: form.querySelector("#early-role"),
    message: form.querySelector("#early-message"),
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let signupId = "";
  let token = "";
  let sending = false;

  function setStatus(element, message, state = "") {
    element.textContent = message;
    element.dataset.state = state;
  }

  function finish() {
    form.hidden = true;
    success.hidden = false;
    success.textContent = "Thanks — we'll be in touch.";
    success.focus({ preventScroll: true });
  }

  function messageFor(response, result, step) {
    if (response.status === 400)
      return step === "email"
        ? "Please check your email address and try again."
        : "Please check the details and try again.";
    if (response.status === 403 || response.status === 404)
      return "That link is no longer valid. Please start again.";
    if (response.status === 409)
      return "This email is already on the list.";
    if (response.status === 429)
      return "Too many requests from this connection. Please try again later.";
    if (response.status === 503)
      return "Sign-ups aren't available right now. Please try again later.";
    return (
      result?.error ||
      "That could not be sent. Please try again in a moment."
    );
  }

  function networkMessage(error) {
    if (error.name === "AbortError")
      return "We couldn't confirm receipt. Please try again when your connection is stable.";
    if (error.name === "TypeError")
      return "Your connection was interrupted. Please try again. Your details are still here.";
    return error.message || "That could not be sent. Please try again later.";
  }

  async function send(url, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      return { response, result };
    } finally {
      clearTimeout(timeout);
    }
  }

  email.addEventListener("input", () => {
    if (email.checkValidity()) email.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const onDetails = !stepTwo.hidden;

    if (!onDetails) {
      const value = email.value.trim();
      const valid =
        value.length > 0 &&
        value.length <= 254 &&
        emailPattern.test(value) &&
        email.checkValidity();
      email.toggleAttribute("aria-invalid", !valid);
      if (!valid) {
        setStatus(
          status,
          value ? "Enter a valid work email." : "Enter your work email.",
          "error",
        );
        email.focus();
        return;
      }
      sending = true;
      stepOneButton.disabled = true;
      stepOneLabel.textContent = "Sending…";
      setStatus(status, "");
      try {
        const { response, result } = await send("/api/early-access", {
          email: value,
          website: form.querySelector("[name=website]").value,
        });
        if (
          (response.status === 201 || response.status === 200) &&
          result?.received === true &&
          result.id &&
          result.token
        ) {
          signupId = result.id;
          token = result.token;
          stepOne.hidden = true;
          stepTwo.hidden = false;
          setStatus(detailsStatus, "");
          const heading = stepTwo.querySelector("h3");
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        } else {
          setStatus(
            status,
            messageFor(response, result, "email"),
            "error",
          );
          status.focus();
        }
      } catch (error) {
        setStatus(status, networkMessage(error), "error");
        status.focus();
      } finally {
        sending = false;
        stepOneButton.disabled = false;
        stepOneLabel.textContent = "Get early access";
      }
      return;
    }

    const details = {
      id: signupId,
      token,
      company: fields.company.value.trim(),
      role: fields.role.value.trim(),
      message: fields.message.value.trim(),
    };
    if (!details.company && !details.role && !details.message) {
      setStatus(
        detailsStatus,
        "Add a little detail, or choose Skip.",
        "error",
      );
      fields.company.focus();
      return;
    }
    sending = true;
    detailsButton.disabled = true;
    detailsLabel.textContent = "Sending…";
    setStatus(detailsStatus, "");
    try {
      const { response, result } = await send(
        "/api/early-access/details",
        details,
      );
      if (response.status === 200 && result?.saved === true) {
        finish();
      } else {
        setStatus(
          detailsStatus,
          messageFor(response, result, "details"),
          "error",
        );
        detailsStatus.focus();
      }
    } catch (error) {
      setStatus(detailsStatus, networkMessage(error), "error");
      detailsStatus.focus();
    } finally {
      sending = false;
      detailsButton.disabled = false;
      detailsLabel.textContent = "Send details";
    }
  });

  skip.addEventListener("click", finish);
})();
