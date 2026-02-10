import { useState, useEffect } from "react";
import { MovieCard } from "../../components/ui/Card";
import movieService from "../../services/movieService";

function UserMovies() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await movieService.getAll();

      // Transform films to match MovieCard expected format
      const transformedFilms = (response.data || []).map((film) => ({
        id: film.id,
        title: film.title,
        image: film.poster || film.thumbnail,
        genre: Array.isArray(film.genres) ? film.genres : film.genre ? film.genre.split(",").map((g) => g.trim()) : [],
        age: film.ageRating,
        duration: film.duration,
        releaseDate: film.releaseDate,
        synopsis: film.synopsis,
      }));

      setFilms(transformedFilms);
    } catch (err) {
      setError(err.message || "Failed to load movies");
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading movies</p>
          <p className="text-tx-light/50 text-sm">{error}</p>
          <button onClick={fetchFilms} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="my-container mt-5 md:mt-10">Movies</h1>

      {films.length > 0 ? (
        <div className="my-container mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
          {films.map((data) => (
            <MovieCard data={data} key={data.id} />
          ))}
        </div>
      ) : (
        <div className="my-container mt-10 text-center py-10">
          <p className="text-tx-light/50">No movies available</p>
        </div>
      )}
    </>
  );
}

export default UserMovies;
