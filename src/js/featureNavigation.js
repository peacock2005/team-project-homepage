(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("view");
    const view = params.has("room")
        ? "group"
        : ["search", "solo", "group"].includes(requested) ? requested : "home";
    document.documentElement.dataset.view = view;
})();
