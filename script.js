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
    tab.addEventListener("click", () => activateTab(tab, { focus: true }));

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

for (const link of tabLinks) {
  link.addEventListener("click", (event) => {
    const targetName = link.dataset.openTab;
    const targetTab = document.querySelector(`[data-tab="${targetName}"]`);

    if (!targetTab) {
      return;
    }

    event.preventDefault();
    targetTab.click();

    const panelId = targetTab.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
