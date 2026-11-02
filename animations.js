(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  function animateHero() {
    if (reduced.matches) return;
    const timeline = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.85 },
    });
    timeline
      .from(".hero-category", { y: 14, opacity: 0, duration: 0.55 })
      .from(
        ".hero h1",
        { y: 26, opacity: 0, duration: 0.95 },
        "-=0.35",
      )
      .from(
        ".hero-description, .hero-support, .hero-statement",
        { y: 16, opacity: 0, stagger: 0.07 },
        "-=0.55",
      )
      .from(".hero-actions > *", { y: 12, opacity: 0, stagger: 0.07 }, "-=0.5")
      .from(
        ".hero-bottom",
        { y: 10, opacity: 0, duration: 0.6 },
        "-=0.4",
      );
  }

  function revealSections() {
    if (reduced.matches) return;
    const targets = gsap.utils.toArray(
      ".section-intro, .foundation-environment, .os-principles > div, .native-context-reveal, .story-intro, .story-return, .delivery-signature, .invitation-copy, .inquiry-form",
    );
    targets.forEach((element) => {
      if (element.closest(".explorer-stage")) return;
      gsap.fromTo(
        element,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    });
  }

  function animateConnectionMap() {
    const map = document.querySelector(".connection-map");
    if (!map || reduced.matches) return;
    ScrollTrigger.create({
      trigger: map,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          [
            ...map.querySelectorAll(".family"),
            map.querySelector(".custom-family"),
          ].filter(Boolean),
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
          },
        );
        gsap.fromTo(
          map.querySelector(".hub"),
          { scale: 0.82, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.85, ease: "back.out(1.4)" },
        );
        gsap.fromTo(
          map.querySelector(".map-lines"),
          { opacity: 0 },
          { opacity: 1, duration: 0.9, delay: 0.15 },
        );
      },
    });
  }

  function animateConsole() {
    const panel = document.querySelector(".intelligence-console");
    if (!panel || reduced.matches) return;
    ScrollTrigger.create({
      trigger: panel,
      start: "top 82%",
      once: true,
      onEnter: () => {
        const run = panel.querySelector(".agent-run:not([hidden])");
        if (!run) return;
        gsap.fromTo(
          run,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
        );
        gsap.fromTo(
          run.querySelectorAll(
            ".run-steps li, .run-request, .decision-card, .customer-result",
          ),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
        );
      },
    });
  }

  function microInteractions() {
    if (reduced.matches || !hover.matches) return;

    // Buttons follow the pointer by a few pixels. The movement is small enough
    // to read as weight, not as a gimmick.
    document.querySelectorAll(".button, .small-cta").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.055;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.09;
        gsap.to(button, { x, y, duration: 0.18, ease: "power1.out", overwrite: "auto" });
      });
      button.addEventListener("pointerleave", () => {
        gsap.to(button, { x: 0, y: 0, duration: 0.35, ease: "power1.out", overwrite: "auto" });
      });
    });

    // A soft spotlight follows the pointer across the runtime panel.
    document.querySelectorAll(".intelligence-console").forEach((panel) => {
      panel.addEventListener("pointermove", (event) => {
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        panel.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      });
    });

    // Module tiles lift as if they are physical parts of the assembly.
    const pieces = document.querySelectorAll(
      ".os-module-unit, .business-tool, .family, .brands li",
    );
    pieces.forEach((piece) => {
      piece.addEventListener("pointerenter", () => {
        gsap.to(piece, { y: -2.5, scale: 1.012, duration: 0.25, ease: "power1.out", overwrite: "auto" });
      });
      piece.addEventListener("pointerleave", () => {
        gsap.to(piece, { y: 0, scale: 1, duration: 0.3, ease: "power1.out", overwrite: "auto" });
      });
    });
  }

  function start() {
    animateHero();
    revealSections();
    animateConnectionMap();
    animateConsole();
    microInteractions();
  }

  if (!document.querySelector("#welcome")) {
    requestAnimationFrame(start);
  } else {
    document.addEventListener("omnia:entered", start, { once: true });
  }
})();
