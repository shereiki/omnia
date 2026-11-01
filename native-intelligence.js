(() => {
  const section = document.querySelector("[data-native-intelligence]");
  if (!section) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const consolePanel = section.querySelector(".intelligence-console");
  const canvas = section.querySelector("[data-native-canvas]");
  const tabs = [...section.querySelectorAll("[data-agent-perspective]")];
  const dimensions = [...section.querySelectorAll("[data-agent-dimension]")];
  const definitions = {
    responsibility: "What the agent is expected to accomplish.",
    knowledge: "Which information it can reference.",
    capabilities: "Which connected tools and Omnia Modules it can use.",
    behavior:
      "Communication style, instructions, language, and operating rules.",
    autonomy: "What it can do independently versus what requires approval.",
    oversight: "Escalations, monitoring, and records of consequential actions.",
  };
  const perspectives = {
    organization: {
      knowledge: "Operating guides & policies",
      knowledgeScope: "Permitted knowledge",
      recordsLabel: "Connected business systems",
      records: "Commitments & current activity",
      recordsScope: "Role-scoped records",
      modules: "Read relevant records. Prepare permitted work.",
      boundaryLabel: "Approval boundary",
      boundary: "Changing an agreed commitment goes to the team.",
      alt: "An illustrative Operations Intelligence agent draws on permitted organizational knowledge, current operational records and authorized Omnia Modules through the native intelligence layer of Omnia OS. It prepares priorities, supporting context and work for review. Changes to commitments require human approval.",
      examples: {
        responsibility:
          "Keep track of commitments, identify what needs attention, and prepare the next steps.",
        knowledge:
          "Operating guides, policies, and the relevant project and commitment records this role is permitted to see.",
        capabilities:
          "Search permitted knowledge, consult current records, prepare follow-ups, and coordinate authorized work through Omnia Modules.",
        behavior:
          "Use your team’s language, communicate clearly, and follow the instructions and operating rules you define.",
        autonomy:
          "Retrieve information and prepare work within scope. Changes to commitments require the appropriate person’s approval.",
        oversight:
          "Escalate important decisions, monitor the responsibility, and keep records of consequential actions.",
      },
    },
    customers: {
      knowledge: "Approved service information & policies",
      knowledgeScope: "Public / approved knowledge",
      recordsLabel: "Verified customer context",
      records: "Only this customer’s authorized details",
      recordsScope: "Own records, after verification",
      modules: "Retrieve options. Prepare a permitted request.",
      boundaryLabel: "Scope boundary",
      boundary:
        "Restricted internal records and other customers’ data stay out of scope.",
      alt: "An illustrative customer-facing service guide on a website uses approved service knowledge, the verified customer’s own authorized details and permitted Omnia Module capabilities. It explains options and prepares a next step for review. Restricted internal records and other customers’ data remain outside its scope. The same native intelligence and Omnia OS foundation remain.",
      examples: {
        responsibility:
          "Help customers understand their options and prepare the right next step through your own customer experience.",
        knowledge:
          "Approved product or service knowledge and policies, plus only the verified customer’s own authorized details.",
        capabilities:
          "Retrieve relevant options, verify permitted account context, and prepare a request through authorized Omnia Modules.",
        behavior:
          "Reflect your business’s tone, personality, languages, instructions, and service boundaries.",
        autonomy:
          "Explain approved options and prepare requests within scope. Exceptions and commitments go to your team.",
        oversight:
          "Escalate sensitive cases, monitor the experience, and retain records of consequential actions without exposing restricted information.",
      },
    },
  };
  let perspective = "organization";
  let dimension = "responsibility";
  let animations = [];
  let revealTimer;
  const set = (selector, value) => {
    section.querySelectorAll(selector).forEach((el) => (el.textContent = value));
  };
  function cancelAnimations() {
    animations.forEach((a) => a.cancel());
    animations = [];
  }
  function animate(elements) {
    cancelAnimations();
    if (reduced.matches) return;
    animations = elements
      .filter(Boolean)
      .map((element) =>
        element.animate(
          [
            { opacity: 0.25, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 400, easing: "cubic-bezier(.22,1,.36,1)" },
        ),
      );
  }
  function updateDimension(announce = false) {
    dimensions.forEach((button) => {
      const selected = button.dataset.agentDimension === dimension;
      button.setAttribute("aria-pressed", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    consolePanel.dataset.focus = dimension;
    set("[data-dimension-definition]", definitions[dimension]);
    set(
      "[data-dimension-example]",
      perspectives[perspective].examples[dimension],
    );
    if (announce)
      animate([section.querySelector(".agent-dimension-detail > div")]);
  }
  function selectPerspective(value, focus = false) {
    if (value === perspective) return;
    perspective = value;
    const data = perspectives[perspective];
    tabs.forEach((tab) => {
      const selected = tab.dataset.agentPerspective === perspective;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden =
        !selected;
      if (selected && focus) tab.focus({ preventScroll: true });
    });
    section.querySelectorAll("[data-agent-result]").forEach((result) => {
      result.hidden = result.dataset.agentResult !== perspective;
    });
    consolePanel.dataset.perspective = perspective;
    canvas.setAttribute("aria-label", data.alt);
    updateDimension();
    animate([
      section.querySelector(`[data-agent-result="${perspective}"]:not([hidden])`),
      document.getElementById(
        tabs
          .find((tab) => tab.dataset.agentPerspective === perspective)
          .getAttribute("aria-controls"),
      ),
    ]);
    clearTimeout(revealTimer);
    consolePanel.classList.remove("scope-reveal");
    if (!reduced.matches) {
      void consolePanel.offsetWidth;
      consolePanel.classList.add("scope-reveal");
      revealTimer = setTimeout(
        () => consolePanel.classList.remove("scope-reveal"),
        600,
      );
    }
    set("[data-native-announcement]", data.alt);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () =>
      selectPerspective(tab.dataset.agentPerspective),
    );
    tab.addEventListener("keydown", (event) => {
      let target;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft")
        target = (index + 1) % tabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      else return;
      event.preventDefault();
      selectPerspective(tabs[target].dataset.agentPerspective, true);
    });
  });
  dimensions.forEach((button, index) => {
    const select = (target, focus = false) => {
      dimension = target.dataset.agentDimension;
      updateDimension(true);
      if (focus) target.focus({ preventScroll: true });
    };
    button.addEventListener("click", () => {
      if (button.dataset.agentDimension !== dimension) select(button);
    });
    button.addEventListener("keydown", (event) => {
      let target;
      if (event.key === "ArrowRight") target = (index + 1) % dimensions.length;
      else if (event.key === "ArrowLeft")
        target = (index + dimensions.length - 1) % dimensions.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = dimensions.length - 1;
      else return;
      event.preventDefault();
      select(dimensions[target], true);
    });
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      cancelAnimations();
      clearTimeout(revealTimer);
      consolePanel.classList.remove("scope-reveal");
    }
  });
  /* Colour picker and the explainers that make the reasoning visible. */
  const picker = section.querySelector(".color-picker");
  const thumb = section.querySelector(".product-thumb");
  const invoiceColor = section.querySelector("[data-invoice-color]");
  picker?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-color]");
    if (!button) return;
    picker.querySelectorAll("button").forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    const color = button.dataset.color;
    if (thumb) thumb.dataset.productColor = color;
    if (invoiceColor) invoiceColor.textContent = color;
    section
      .querySelectorAll("[data-selected-color]")
      .forEach((el) => (el.textContent = color.toLowerCase()));
  });
  section.querySelectorAll(".explain-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(
        button.getAttribute("aria-controls"),
      );
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      const sign = button.querySelector("span");
      if (sign) sign.textContent = open ? "−" : "+";
    });
  });

  updateDimension();
})();
