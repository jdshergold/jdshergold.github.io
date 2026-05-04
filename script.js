document.documentElement.classList.add("has-tabs");

const tabShells = document.querySelectorAll("[data-tabs]");

for (const shell of tabShells) {
  const tabs = Array.from(shell.querySelectorAll("[role='tab']")).filter((tab) => {
    const panelId = tab.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    return panel && panel.closest("[data-tabs]") === shell;
  });

  if (!tabs.length) {
    continue;
  }

  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls"))
  );

  const activateTab = (nextTab, options = {}) => {
    const { focus = false } = options;

    tabs.forEach((tab, index) => {
      const selected = tab === nextTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (panels[index]) {
        panels[index].hidden = !selected;
      }
    });

    if (focus) {
      nextTab.focus();
    }
  };

  const initialTab =
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];

  activateTab(initialTab);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (event) => {
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = null;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(tabs[nextIndex], { focus: true });
      }
    });
  });
}

const tabLinks = document.querySelectorAll("[data-open-tab]");
const tabActivators = document.querySelectorAll("[data-activate-tab]");
const mobileNav = document.querySelector(".site-nav");
const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
const mobileNavPanel = document.querySelector(".mobile-nav-panel");

const closeMobileMenu = () => {
  if (!mobileNav || !mobileNavToggle) {
    return;
  }

  mobileNav.classList.remove("mobile-menu-open");
  mobileNavToggle.setAttribute("aria-expanded", "false");
};

if (mobileNav && mobileNavToggle && mobileNavPanel) {
  mobileNavToggle.addEventListener("click", () => {
    const nextOpen = !mobileNav.classList.contains("mobile-menu-open");
    mobileNav.classList.toggle("mobile-menu-open", nextOpen);
    mobileNavToggle.setAttribute("aria-expanded", String(nextOpen));
  });

  document.addEventListener("click", (event) => {
    if (
      mobileNav.classList.contains("mobile-menu-open") &&
      event.target instanceof Node &&
      !mobileNav.contains(event.target)
    ) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMobileMenu();
    }
  });
}

for (const link of tabLinks) {
  link.addEventListener("click", (event) => {
    const targetName = link.dataset.openTab;
    const targetTab = document.querySelector(`[data-tab="${targetName}"]`);

    if (!targetTab) {
      return;
    }

    event.preventDefault();
    targetTab.click();
    closeMobileMenu();

    const panelId = targetTab.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

for (const control of tabActivators) {
  control.addEventListener("click", () => {
    const targetName = control.dataset.activateTab;
    const targetTab = document.querySelector(`[data-tab="${targetName}"]`);

    if (targetTab) {
      targetTab.click();
      closeMobileMenu();
    }
  });
}

document.querySelectorAll(".mobile-nav-panel a, .mobile-nav-panel button[role='tab']").forEach((item) => {
  item.addEventListener("click", () => {
    closeMobileMenu();
  });
});

const yyzSequence = "yyz";
let yyzBuffer = "";
let yyzTimer = null;
const yyzPhrase = [
  "dash",
  "dot",
  "dash",
  "dash",
  "dash",
  "dot",
  "dash",
  "dash",
  "dash",
  "dash",
  "dot",
  "dot",
];
const yyzBpm = 107;
const yyzQuarter = 60 / yyzBpm;
const yyzDurations = {
  dash: yyzQuarter / 2,
  dot: yyzQuarter / 4,
};

const yyzUiTimers = [];
let yyzIntroTemplate = null;

const clearYyzFlashTimers = () => {
  while (yyzUiTimers.length) {
    window.clearTimeout(yyzUiTimers.pop());
  }
  document.body.classList.remove("yyz-flash");
};

const getYyzPulses = () => {
  let elapsed = 0;
  const pulses = [];

  const appendSymbol = (symbol) => {
    const duration = yyzDurations[symbol];
    pulses.push({ start: elapsed, duration, symbol });
    elapsed += duration;
  };

  yyzPhrase.forEach(appendSymbol);
  yyzPhrase.forEach(appendSymbol);

  return pulses;
};

const getYyzIntroTemplate = () => {
  if (!yyzIntroTemplate) {
    yyzIntroTemplate = new Audio("assets/audio/yyz_intro.wav");
    yyzIntroTemplate.preload = "auto";
  }

  return yyzIntroTemplate;
};

const playYyzIntro = () => {
  const template = getYyzIntroTemplate();
  const player = new Audio(template.currentSrc || template.src || "assets/audio/yyz_intro.wav");
  player.preload = "auto";
  player.volume = 0.9;
  player.currentTime = 0;

  const cleanup = () => {
    player.removeEventListener("ended", cleanup);
    player.removeEventListener("pause", cleanup);
  };

  player.addEventListener("ended", cleanup);
  player.addEventListener("pause", cleanup);

  return player.play();
};

const flashYyz = (pulses, startDelay = 0) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  clearYyzFlashTimers();

  pulses.forEach((pulse) => {
    yyzUiTimers.push(
      window.setTimeout(() => {
        document.body.classList.add("yyz-flash");
      }, startDelay + Math.round(pulse.start * 1000))
    );

    yyzUiTimers.push(
      window.setTimeout(() => {
        document.body.classList.remove("yyz-flash");
      }, startDelay + Math.round((pulse.start + pulse.duration) * 1000))
    );
  });
};

const triggerYyz = async () => {
  const pulses = getYyzPulses();
  flashYyz(pulses, 0);
  await playYyzIntro();
};

window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT")
  ) {
    return;
  }

  if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) {
    return;
  }

  yyzBuffer = `${yyzBuffer}${event.key.toLowerCase()}`.slice(-yyzSequence.length);
  window.clearTimeout(yyzTimer);
  yyzTimer = window.setTimeout(() => {
    yyzBuffer = "";
  }, 1500);

  if (yyzBuffer === yyzSequence) {
    yyzBuffer = "";
    void triggerYyz().catch((error) => {
      console.error("YYZ easter egg failed:", error);
    });
  }
});
