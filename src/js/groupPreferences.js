export function filterGroupMovies(movies, preferences) {
    const avoidedTriggers = new Set(preferences.flatMap(member => member.avoidedTriggers));
    const preferredGenres = new Set(preferences.flatMap(member => member.genres.map(genre => genre.toLowerCase())));

    return movies.filter(movie => {
        const passesTriggers = avoidedTriggers.size === 0 || (
            Array.isArray(movie.triggers)
            && movie.triggers.every(trigger => !avoidedTriggers.has(trigger))
        );
        const passesGenres = preferredGenres.size === 0
            || movie.genres.some(genre => preferredGenres.has(genre.toLowerCase()));
        return passesTriggers && passesGenres;
    });
}
