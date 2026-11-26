import { getMovies } from "./api.js";

async function startApp() {
    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");
    const movieGrid = document.querySelector("#movie-grid");
    const movieCount = document.querySelector(".search-row__number");

    try {
        const movies = await getMovies();
        console.log("Movies loaded:", movies);

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

        function searchMovies() {
            const query = searchInput.value.trim().toLowerCase();

            const results = movies.filter((movie) =>
                movie.title.toLowerCase().includes(query)
            );

            showMovies(results);
        }

        // Search when the button is clicked.
        searchButton.addEventListener("click", searchMovies);

        // Search when Enter is pressed in the search input.
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                searchMovies();
            }
        });

        // Show all movies when the page first loads.
        showMovies(movies);
    } catch (error) {
        console.error("Could not load movies:", error);
        movieCount.textContent = "0";
        movieGrid.textContent = "Could not load movies. Please try again.";
    }
}

startApp();