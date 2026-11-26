// Loads sample movie data until the movie API is connected.
export async function getMovies() {
    const response = await fetch("./src/data/mockData.json");

    if (!response.ok) {
        throw new Error("Failed to load movie data.");
    }

    return await response.json();
}