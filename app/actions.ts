"use server"

import {
    getMovieReviews,
    getSimilarMovies,
    getRecommendedMovies,
    getMovieKeywords,
    getCollection,
} from "@/lib/tmdb-server"

export async function getMovieExtraDetails(movieId: number) {
    const [reviews, similar, recommendations, keywords] = await Promise.all([
        getMovieReviews(movieId),
        getSimilarMovies(movieId),
        getRecommendedMovies(movieId),
        getMovieKeywords(movieId),
    ])

    return {
        reviews: reviews.results,
        similarMovies: similar.results,
        recommendations: recommendations.results,
        keywords: keywords.keywords,
    }
}

export async function getMovieCollection(collectionId: number) {
    return getCollection(collectionId)
}
