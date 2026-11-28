const soloPanel = document.querySelector(".filters-panel");
const groupPanel = document.querySelector("#group-recommendations");
const destinations = {
    solo: { panel: soloPanel, target: document.querySelector("#personal-filters") },
    group: { panel: groupPanel, target: groupPanel.querySelector("summary") },
    search: { target: document.querySelector("#search-input") },
};

for (const link of document.querySelectorAll("[data-open-feature]")) {
    link.addEventListener("click", event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();

        const { panel, target } = destinations[link.dataset.openFeature];
        if (panel) panel.open = true;
        target.scrollIntoView({ block: "nearest" });
        target.focus({ preventScroll: true });
    });
}
