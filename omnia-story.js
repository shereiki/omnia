(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* One dashboard, no slides */
  const story = document.querySelector("[data-omnia-story]");
  if (!story) return;
  const assembly = story.querySelector("[data-explorer-assembly]");
  const composition = assembly.querySelector(".os-three-zones");
  if (!composition) return;
  const header = document.querySelector(".header");

  const mapOutputs = [
    "One record across sales, operations and finance",
    "Same systems, better decisions",
    "Work stays in tools you already pay for",
    "Fewer handoffs across service and HR",
    "Exceptions resolved before they cost you",
  ];

  const wrap = document.createElement("div");
  wrap.className = "explorer-stage-wrap";
  wrap.dataset.explorerWrap = "";
  const pin = document.createElement("div");
  pin.className = "explorer-pin";
  pin.dataset.explorerPin = "";
  const dashboard = document.createElement("div");
  dashboard.className = "explorer-dashboard";

  const map = document.createElement("div");
  map.className = "explorer-stage-map explorer-map";
  map.setAttribute("aria-hidden", "true");
  map.innerHTML = `
    <div class="map-sources"><span>Workspace</span><span>Records</span><span>Data</span></div>
    <i class="map-connector" aria-hidden="true"></i>
    <div class="map-os">
      <div class="map-os-head">
        <svg viewBox="0 0 430 440" aria-hidden="true"><use href="#mark" /></svg>
        <strong>Omnia OS</strong>
      </div>
      <div class="map-intelligence"><i aria-hidden="true"></i>Shared records &amp; permissions</div>
      <div class="map-modules"></div>
    </div>
    <i class="map-connector" aria-hidden="true"></i>
    <div class="map-output"><span>Your Solution</span><strong></strong></div>`;

  assembly.append(wrap);
  wrap.append(pin);
  pin.append(dashboard);
  dashboard.append(composition);
  dashboard.append(map);
  assembly.classList.add("explorer-pin-mode");

  /* Small screens show the same dashboard; previews fold into one line. */
  const solutionLine = document.createElement("p");
  solutionLine.className = "os-solution-line";
  solutionLine.setAttribute("aria-hidden", "true");
  solutionLine.innerHTML = "<i></i><span></span>";
  composition.querySelector(".os-output-body")?.append(solutionLine);
  const solutionText = solutionLine.querySelector("span");
  const compact = matchMedia("(max-width: 1099px)");

  const mapIntel = map.querySelector(".map-intelligence");
  const mapModules = map.querySelector(".map-modules");
  const mapOutput = map.querySelector(".map-output strong");
  let scene = -1;
  let progress = -1;
  let scrollTrigger = null;
  let resizeFrame = 0;

  const syncHeader = () =>
    assembly.style.setProperty(
      "--os-header-height",
      `${header.getBoundingClientRect().height}px`,
    );
  new ResizeObserver(syncHeader).observe(header);
  syncHeader();

  function outputDrop(element) {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.9,
        y: 22,
        rotateX: -7,
        transformPerspective: 900,
        transformOrigin: "center top",
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        duration: 0.64,
        ease: "power3.out",
        overwrite: true,
      },
    );
  }

  function moduleDrop(element) {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.52, y: -18, rotate: -2 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        duration: 0.56,
        ease: "back.out(1.5)",
        overwrite: true,
      },
    );
  }

  function applyMap(index) {
    const capabilities = [
      ...composition.querySelectorAll("[data-module-stage]"),
    ]
      .filter((element) => Number(element.dataset.moduleStage) <= index)
      .map((element) => element.querySelector("strong")?.textContent.trim())
      .filter(Boolean);
    mapIntel.dataset.active = String(index >= 1);
    mapModules.innerHTML = `${capabilities
      .map((label) => `<span>${label}</span>`)
      .join("")}<span class="map-socket">+</span>`;
    mapOutput.textContent = mapOutputs[index];
    if (solutionText.textContent !== mapOutputs[index]) {
      solutionText.textContent = mapOutputs[index];
      if (compact.matches && !reduced.matches && progress >= 0) {
        gsap.fromTo(
          solutionLine,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: true },
        );
      }
    }
    fitDashboard();
  }

  /* Keep the stacked dashboard inside the pinned viewport on short phones. */
  function fitDashboard() {
    if (!compact.matches) {
      composition.style.removeProperty("--dash-zoom");
      return;
    }
    composition.style.setProperty("--dash-zoom", "1");
    const available =
      (parseFloat(assembly.style.getPropertyValue("--story-pin-height")) ||
        innerHeight) - 24;
    const natural = composition.offsetHeight;
    const zoom = natural > available ? Math.max(0.72, available / natural) : 1;
    composition.style.setProperty("--dash-zoom", zoom.toFixed(3));
  }

  function applyScene(index, animate = true) {
    if (index === scene) return;
    scene = index;
    composition
      .querySelectorAll("[data-module-stage],[data-effect-stage]")
      .forEach((element) => {
        const threshold = Number(
          element.dataset.moduleStage ?? element.dataset.effectStage,
        );
        const visible = index >= threshold;
        const wasHidden = element.hidden;
        element.hidden = !visible;
        element.dataset.active = String(visible);
        element.setAttribute("aria-hidden", String(!visible));
        if (visible && wasHidden && animate && !reduced.matches) {
          if (element.matches("[data-effect-stage]")) outputDrop(element);
          else moduleDrop(element);
        }
      });
    const band = composition.querySelector("[data-native-band]");
    if (band) {
      const wasHidden = band.hidden;
      band.hidden = index < 1;
      band.dataset.active = String(index >= 1);
      if (index >= 1 && wasHidden && animate && !reduced.matches) {
        gsap.fromTo(
          band,
          { opacity: 0, y: -12, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.4)",
            overwrite: true,
          },
        );
      }
    }
    const bandState = composition.querySelector("[data-native-band-state]");
    if (bandState)
      bandState.textContent =
        index >= 1
          ? "Shared records, routed work, fewer handoffs"
          : "Part of the foundation";
    const introduction = composition.querySelector("[data-output-introduction]");
    if (introduction) introduction.hidden = index >= 2;
    applyMap(index);
    if (animate && !reduced.matches) {
      gsap.fromTo(
        composition,
        { scale: 0.998 },
        { scale: 1, duration: 0.45, ease: "power2.out", overwrite: true },
      );
    }
  }

  function setProgress(value) {
    const nextValue = Math.max(0, Math.min(1, value));
    if (Math.abs(nextValue - progress) < 0.0002) return;
    progress = nextValue;
    applyScene(
      Math.max(0, Math.min(4, Math.round(nextValue * (stagesCount - 1)))),
      true,
    );
  }
  const stagesCount = 5;

  function measure() {
    const headerHeight = header.getBoundingClientRect().height;
    const pinHeight = Math.max(520, innerHeight - headerHeight);
    assembly.style.setProperty("--story-pin-height", `${pinHeight}px`);
    assembly.style.setProperty("--dash-max", `${pinHeight - 46}px`);
    return pinHeight;
  }

  function layout() {
    const pinHeight = measure();
    const step = compact.matches
      ? Math.max(280, innerHeight * 0.36)
      : Math.min(760, Math.max(420, innerHeight * 0.55));
    const distance = step * (stagesCount - 1);
    wrap.style.height = `${pinHeight + distance}px`;
    assembly.style.setProperty("--story-distance", `${distance}px`);
    scrollTrigger?.refresh();
    applyScene(scene < 0 ? 0 : scene, false);
    fitDashboard();
  }

  function createTrigger() {
    scrollTrigger = ScrollTrigger.create({
      trigger: wrap,
      start: () => `top top+=${header.getBoundingClientRect().height}`,
      end: () => "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
      onRefresh: (self) => {
        if (self.progress !== undefined) setProgress(self.progress);
      },
    });
  }

  addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(layout);
  });
  reduced.addEventListener("change", layout);
  compact.addEventListener("change", layout);

  composition.addEventListener(
    "pointermove",
    (event) => {
      if (reduced.matches) return;
      const rect = composition.getBoundingClientRect();
      composition.style.setProperty(
        "--glass-x",
        `${event.clientX - rect.left}px`,
      );
      composition.style.setProperty(
        "--glass-y",
        `${event.clientY - rect.top}px`,
      );
    },
    { passive: true },
  );
  composition.addEventListener("pointerleave", () => {
    composition.style.setProperty("--glass-x", "28%");
    composition.style.setProperty("--glass-y", "4%");
  });

  applyScene(0, false);
  layout();
  createTrigger();
  ScrollTrigger.refresh();
  document.fonts.ready.then(layout);
  document.addEventListener("omnia:entered", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      layout();
      ScrollTrigger.refresh();
    });
  });
  layout();
})();
