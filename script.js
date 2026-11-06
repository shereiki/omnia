(() => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.querySelector(".menu");
  const navigation = document.querySelector("#navigation");
  let lenis = null;
  let frame = null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  const scenes = [...document.querySelectorAll(".motion-scene")];
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.target.classList.toggle("in-view", entry.isIntersecting),
      );
    },
    { threshold: 0.08 },
  );

  /* ---------- Smooth scroll, governed ---------- */

  // Touch devices keep native, compositor-driven scrolling. Smooth wheel
  // scrolling is only a desktop refinement.
  const smoothScrollCapable = matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 1100px)",
  );

  function animate(time) {
    if (!lenis || document.hidden) return;
    lenis.raf(time);
    frame = requestAnimationFrame(animate);
  }

  // One animation loop governs both systems. GSAP's ticker drives Lenis and
  // ScrollTrigger reads the same scroll position, so the pinned story and the
  // smooth scroll can never disagree by a frame.
  function gsapTick(time) {
    if (!lenis) return;
    lenis.raf(time * 1000);
  }

  function configureMotion() {
    document.documentElement.dataset.motion = reducedMotion.matches
      ? "off"
      : "on";
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (gsap) gsap.ticker.remove(gsapTick);
    if (lenis) {
      lenis.off?.("scroll", ScrollTrigger?.update);
      lenis.destroy();
    }
    lenis = null;
    if (
      !reducedMotion.matches &&
      smoothScrollCapable.matches &&
      typeof window.Lenis === "function"
    ) {
      lenis = new Lenis({
        duration: 0.95,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        syncTouch: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      if (gsap) {
        gsap.ticker.add(gsapTick);
        gsap.ticker.lagSmoothing(0);
      } else if (!document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    }
    ScrollTrigger?.refresh();
  }

  reducedMotion.addEventListener("change", configureMotion);
  smoothScrollCapable.addEventListener("change", configureMotion);
  document.addEventListener("visibilitychange", () => {
    document.documentElement.toggleAttribute(
      "data-page-hidden",
      document.hidden,
    );
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (!document.hidden && lenis && !gsap) {
      frame = requestAnimationFrame(animate);
    }
  });

  /* ---------- Ambient motion only runs where it can be seen ---------- */

  const ambientObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) =>
        entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting),
      ),
    { rootMargin: "120px 0px" },
  );
  document
    .querySelectorAll("main > *, .site-footer, footer")
    .forEach((element) => ambientObserver.observe(element));

  /* ---------- Navigation ---------- */

  const mobileNavigation = matchMedia("(max-width: 760px)");
  function syncNavigation() {
    navigation.inert =
      mobileNavigation.matches && !navigation.classList.contains("open");
  }
  syncNavigation();
  mobileNavigation.addEventListener("change", () => {
    closeMenu();
    syncNavigation();
  });

  function closeMenu() {
    navigation.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    syncNavigation();
  }

  menu.addEventListener("click", () => {
    const opened = navigation.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(opened));
    menu.setAttribute(
      "aria-label",
      opened ? "Close navigation" : "Open navigation",
    );
    syncNavigation();
    if (opened)
      requestAnimationFrame(() => {
        if (navigation.classList.contains("open"))
          navigation.querySelector("a").focus({ preventScroll: true });
      });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      closeMenu();
      menu.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-inner")) closeMenu();
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    closeMenu();
    if (lenis) {
      event.preventDefault();
      history.pushState(null, "", link.hash);
      const currentScroll = window.scrollY;
      const headerSpace =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      const destination =
        target.getBoundingClientRect().top + currentScroll - headerSpace;
      lenis.scrollTo(currentScroll, { immediate: true });
      lenis.scrollTo(destination, {
        onComplete: () => target.focus({ preventScroll: true }),
      });
    }
  });

  const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const navigationSections = navigationLinks.map((link) =>
    document.querySelector(link.hash),
  );
  // Active-section tracking is observed, not measured on every scroll frame.
  const headerElement = document.querySelector(".header");
  const scrolledSentinel = document.createElement("div");
  scrolledSentinel.setAttribute("aria-hidden", "true");
  scrolledSentinel.style.cssText =
    "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none";
  document.body.prepend(scrolledSentinel);
  new IntersectionObserver(([entry]) => {
    headerElement.classList.toggle("is-scrolled", !entry.isIntersecting);
  }).observe(scrolledSentinel);
  const visibleSections = new Set();
  const navigationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const current = navigationSections.findIndex((section) =>
        visibleSections.has(section),
      );
      navigationLinks.forEach((link, index) => {
        if (index === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-35% 0px -65% 0px" },
  );
  navigationSections.forEach(
    (section) => section && navigationObserver.observe(section),
  );

  document.addEventListener("omnia:scenejump", (event) => {
    const { element, offset = 0, top, onComplete } = event.detail;
    const destination = Number.isFinite(top)
      ? top
      : scrollY + element.getBoundingClientRect().top - offset;
    if (lenis) {
      lenis.scrollTo(destination, { onComplete });
    } else {
      scrollTo({
        top: destination,
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
      if (reducedMotion.matches) onComplete?.();
      else {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          removeEventListener("scrollend", finish);
          onComplete?.();
        };
        addEventListener("scrollend", finish, { once: true });
        setTimeout(finish, 900);
      }
    }
  });

  /* The connectors are drawn from the measured cards, so every line has a
     real endpoint at any viewport width. */
  const connectionMap = document.querySelector(".connection-map");
  let mapFrame = null;
  function drawConnectionMap() {
    if (!connectionMap) return;
    const svg = connectionMap.querySelector(".map-lines");
    const base = svg?.querySelector(".map-base");
    const signal = svg?.querySelector(".map-signal");
    if (!svg || !base || !signal) return;
    const left = connectionMap.querySelector(".global-family");
    const hub = connectionMap.querySelector(".hub");
    const right = connectionMap.querySelector(".regional-family");
    const custom = connectionMap.querySelector(".custom-family");
    if (!left || !hub || !right || !custom) return;
    const box = connectionMap.getBoundingClientRect();
    if (!box.width) return;
    const rect = (element) => {
      const r = element.getBoundingClientRect();
      return {
        left: r.left - box.left,
        right: r.right - box.left,
        top: r.top - box.top,
        bottom: r.bottom - box.top,
        width: r.width,
        height: r.height,
      };
    };
    const l = rect(left);
    const h = rect(hub);
    const hi = rect(hub.querySelector(".hub-icon") || hub);
    const r = rect(right);
    const c = rect(custom);
    const hubMiddle = hi.top + hi.height / 2;
    const bend = 28;
    const fromLeft = (x1, y1, x2, y2) =>
      `M${x1} ${y1} C${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`;
    const fromRight = (x1, y1, x2, y2) =>
      `M${x1} ${y1} C${x1 - bend} ${y1} ${x2 + bend} ${y2} ${x2} ${y2}`;
    const paths = [
      {
        cls: "line-global",
        d: fromLeft(l.right, l.top + l.height * 0.28, hi.left, hubMiddle - 16),
      },
      {
        cls: "line-global",
        d: fromLeft(l.right, l.top + l.height * 0.72, hi.left, hubMiddle + 16),
      },
      {
        cls: "line-regional",
        d: fromRight(r.left, r.top + r.height * 0.28, hi.right, hubMiddle - 16),
      },
      {
        cls: "line-regional",
        d: fromRight(r.left, r.top + r.height * 0.72, hi.right, hubMiddle + 16),
      },
      {
        cls: "line-custom",
        d: `M${c.left + c.width / 2} ${c.top} V${h.bottom + 4}`,
      },
    ];
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const markup = paths
      .map(({ cls, d }) => `<path class="${cls}" d="${d}" />`)
      .join("");
    base.innerHTML = markup;
    signal.innerHTML = markup;
  }
  function scheduleConnectionMap() {
    if (!connectionMap || mapFrame !== null) return;
    mapFrame = requestAnimationFrame(() => {
      mapFrame = null;
      drawConnectionMap();
    });
  }
  if (connectionMap) {
    scheduleConnectionMap();
    addEventListener("resize", scheduleConnectionMap, { passive: true });
    document.fonts?.ready.then(scheduleConnectionMap);
    document.addEventListener("omnia:entered", scheduleConnectionMap);
    if (ScrollTrigger)
      ScrollTrigger.addEventListener("refresh", scheduleConnectionMap);
  }

  /* ---------- Disclosures: one reversible opening and closing gesture ---------- */

  document.querySelectorAll("details").forEach((disclosure) => {
    const summary = disclosure.querySelector(":scope > summary");
    if (!summary) return;
    const body = document.createElement("div");
    body.className = "disclosure-body";
    const content = document.createElement("div");
    content.className = "disclosure-content";
    while (summary.nextSibling) content.append(summary.nextSibling);
    body.append(content);
    disclosure.append(body);

    let expanded = disclosure.open;
    let animation = null;
    let contentAnimation = null;
    summary.setAttribute("aria-expanded", String(expanded));
    disclosure.dataset.expanded = String(expanded);
    body.inert = !expanded;

    function settle() {
      animation?.cancel();
      contentAnimation?.cancel();
      animation = null;
      contentAnimation = null;
      disclosure.open = expanded;
      body.style.removeProperty("height");
      body.classList.remove("is-animating");
    }

    function transition(next) {
      // Read the currently painted height before cancelling so a quick second
      // click reverses from this frame rather than snapping to an endpoint.
      const from = disclosure.open ? body.getBoundingClientRect().height : 0;
      const painted = getComputedStyle(content);
      const fromOpacity = disclosure.open ? painted.opacity : "0";
      const fromTransform = disclosure.open
        ? painted.transform
        : "translateY(-6px)";
      expanded = next;
      summary.setAttribute("aria-expanded", String(expanded));
      disclosure.dataset.expanded = String(expanded);
      body.inert = !expanded;
      if (reducedMotion.matches) {
        settle();
        return;
      }
      body.style.height = `${from}px`;
      animation?.cancel();
      disclosure.open = true;
      body.classList.add("is-animating");
      const to = expanded ? content.getBoundingClientRect().height : 0;
      animation = body.animate(
        [{ height: `${from}px` }, { height: `${to}px` }],
        {
          duration: expanded ? 440 : 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
      contentAnimation?.cancel();
      contentAnimation = content.animate(
        [
          { opacity: fromOpacity, transform: fromTransform },
          {
            opacity: expanded ? 1 : 0,
            transform: expanded ? "translateY(0)" : "translateY(-6px)",
          },
        ],
        {
          duration: expanded ? 320 : 180,
          easing: "ease-out",
          fill: "forwards",
        },
      );
      animation.onfinish = settle;
    }

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      transition(!expanded);
    });
    // Text reflow during a resize updates the destination, not a fixed max-height.
    new ResizeObserver(() => {
      if (animation && expanded) transition(true);
    }).observe(content);
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches && animation) settle();
    });
  });

  scenes.forEach((scene) => sceneObserver.observe(scene));
  configureMotion();

  function announceEntered() {
    document.dispatchEvent(new CustomEvent("omnia:entered"));
  }
  if (document.readyState === "complete") {
    announceEntered();
  } else {
    document.addEventListener("DOMContentLoaded", announceEntered, {
      once: true,
    });
  }

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
