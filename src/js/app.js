import { searchMovies } from "./api.js";

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
            const title = document.createElement("p");
            title.textContent = movie.title;
            movieGrid.appendChild(title);
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