// Search for movies through the local Python server.
export async function searchMovies(query) {
    const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch movies.");
    }

    const data = await response.json();

    return data.results;
}