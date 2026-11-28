import { filterGroupMovies } from "./groupPreferences.js";

const form = document.querySelector("#filters-form");
const section = document.querySelector("#solo-recommendations");
const heading = section.querySelector("h2");
const status = section.querySelector("[role=status]");
const results = section.querySelector("ul");
const submitButton = document.querySelector('button[form="filters-form"]');
let catalog;

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitButton.disabled) return;

    const choices = new FormData(form);
    const genres = choices.getAll("genre");
    const avoidedTriggers = choices.getAll("content-warning");
    section.hidden = false;
    heading.focus();
    results.replaceChildren();
    status.textContent = "Finding sample movies…";
    submitButton.disabled = true;

    try {
        if (!catalog) {
            const response = await fetch(new URL("../data/recommendationMovies.json", import.meta.url));
            if (!response.ok) throw new Error("Sample catalog unavailable");
            catalog = await response.json();
        }

        const movies = filterGroupMovies(catalog, [{ avoidedTriggers, genres }]);
        status.textContent = movies.length
            ? `${movies.length} matching sample ${movies.length === 1 ? "movie" : "movies"}`
            : "No sample movies match your selections.";
        for (const movie of movies) {
            const item = document.createElement("li");
            const title = document.createElement("h3");
            title.textContent = movie.title;
            const genres = document.createElement("p");
            genres.textContent = movie.genres.join(" · ");
            item.append(title, genres);
            results.append(item);
        }
    } catch {
        status.textContent = "Could not load sample movies. Try again.";
    } finally {
        submitButton.disabled = false;
    }
});
