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
    const genres = choices.getAll("genre").map(genre => genre.toLowerCase());
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
            catalog = (await response.json()).map(movie => ({
                ...movie,
                genres: movie.genres.map(genre => genre.toLowerCase()),
            }));
        }

        const movies = filterGroupMovies(catalog, [{ avoidedTriggers, genres }]);
        status.textContent = movies.length
            ? "Showing sample movies that match your selections."
            : "No sample movies match your selections.";
        for (const movie of movies) {
            const item = document.createElement("li");
            item.textContent = movie.title;
            results.append(item);
        }
    } catch {
        status.textContent = "Could not load sample movies. Try again.";
    } finally {
        submitButton.disabled = false;
    }
});
