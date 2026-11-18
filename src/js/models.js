/**
 * Creates a movie object used throughout Framecheck.
 */
export function createMovie({
    id,
    title,
    overview = "",
    posterPath = "",
    releaseDate = "",
    genres = []
}) {
    return {
        id,
        title,
        overview,
        posterPath,
        releaseDate,
        genres
    };
}

/**
 * Creates a trigger category used for content warnings.
 */
export function createTrigger({
    id,
    name,
    category = ""
}) {
    return {
        id,
        name,
        category
    };
}

/**
 * Creates trigger-warning information for a movie.
 */
export function createMovieTrigger({
    movieId,
    triggers = {}
}) {
    return {
        movieId,
        triggers
    };
}
