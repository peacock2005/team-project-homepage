import { searchMovies } from "./api.js";
// Open the filters on wider screens and collapse them on small screens.
const filtersPanel = document.querySelector(".filters-panel");
const smallScreen = window.matchMedia("(max-width: 767px)");

function updateFiltersPanel(event) {
    if (!filtersPanel) return;

    filtersPanel.open = !event.matches;
}

updateFiltersPanel(smallScreen);
smallScreen.addEventListener("change", updateFiltersPanel);

async function startApp() {
    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");
    const movieGrid = document.querySelector("#movie-grid");
    const movieCount = document.querySelector(".search-row_number");

    function showMovies(movieList) {
        // Clear the previous search results.
        movieGrid.replaceChildren();

        // Show the number of movies currently displayed.
        movieCount.textContent = movieList.length;

        if (movieList.length === 0) {
            movieGrid.textContent = "No movies found.";
            return;
        }

        movieList.forEach((movie) => {
            // Create a card for each movie.
            const card = document.createElement("article");
            card.className = "movie-card";

            // Use a button so both the poster and title open the details.
            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "movie-card_button";

            const movieTitle = movie.title || "Untitled movie";
            const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "";
        
            if (posterUrl) {
                const poster = document.createElement("img");
                poster.className = "movie-card_poster";
                poster.src = posterUrl;
                poster.alt = "";
                poster.loading = "lazy";
                openButton.appendChild(poster);
            } else {
                const noPoster = document.createElement("div");
                noPoster.className = "movie-card_no-poster";
                noPoster.textContent = "No poster available";
                openButton.appendChild(noPoster);
            }
        
            const title = document.createElement("span");
            title.className = "movie-card_title";
            title.textContent = movieTitle;
        
            openButton.appendChild(title);
            card.appendChild(openButton);
            movieGrid.appendChild(card);

            // Open a dialog with the selected movie's details.
            openButton.addEventListener("click", () => {
                const dialog = document.createElement("dialog");
                dialog.className = "movie-dialog";
                dialog.setAttribute("aria-labelledby", "movie-dialog-title");

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "movie-dialog_close";
                closeButton.textContent = "×";
                closeButton.setAttribute("aria-label", "Close movie details");
            
                if (posterUrl) {
                    const dialogPoster = document.createElement("img");
                    dialogPoster.className = "movie-dialog_poster";
                    dialogPoster.src = posterUrl;
                    dialogPoster.alt = `${movieTitle} poster`;
                    dialog.appendChild(dialogPoster);
                }
            
                const content = document.createElement("div");
                content.className = "movie-dialog_content";

                const dialogTitle = document.createElement("h2");
                dialogTitle.id = "movie-dialog-title";
                dialogTitle.textContent = movieTitle;

                const releaseDate = document.createElement("p");
                releaseDate.textContent = movie.release_date
                ? `Release date: ${movie.release_date}`
                : "Release date unavailable";

                const overview = document.createElement("p");
                overview.textContent = movie.overview || "No overview available.";

                content.append(dialogTitle, releaseDate, overview);
                dialog.prepend(closeButton);
                dialog.appendChild(content);
                document.body.appendChild(dialog);

                closeButton.addEventListener("click", () => dialog.close());
                dialog.addEventListener("close", () => dialog.remove());

                dialog.showModal();
            });
        });
    }

    async function handleSearch() {
        const query = searchInput.value.trim();

        if (!query) {
            movieGrid.textContent = "Please enter a movie title.";
            movieCount.textContent = "0";
            return;
        }

        movieGrid.textContent = "Searching...";
        movieCount.textContent = "0";

        try {
            const movies = await searchMovies(query);
            showMovies(movies);
        } catch (error) {
            console.error("Movie search failed:", error);
            movieGrid.textContent = "Could not load movies. Please try again.";
        }
    }

    // Search when the button is clicked.
    searchButton.addEventListener("click", handleSearch);

    // Search when Enter is pressed in the search input.
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    // Wait for the user to enter a search query.
    movieGrid.textContent = "Search for a movie by title.";
    movieCount.textContent = "0";
}

startApp();