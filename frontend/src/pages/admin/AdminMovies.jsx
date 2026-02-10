import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import movieService from "../../services/movieService";

export default function AdminMovies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movies from backend
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieService.getAll();

      if (response.success) {
        // Calculate status based on release date
        const moviesWithStatus = response.data.map((movie) => ({
          ...movie,
          status: getFilmStatus(movie.releaseDate),
        }));
        setMovies(moviesWithStatus);
      } else {
        setError(response.message || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Calculate film status based on release date
  const getFilmStatus = (releaseDate) => {
    if (!releaseDate) return "now-showing";
    const release = new Date(releaseDate);
    const now = new Date();
    return release <= now ? "now-showing" : "coming-soon";
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || movie.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      const response = await movieService.delete(id);
      if (response.success) {
        // Remove from local state
        setMovies(movies.filter((m) => m.id !== id));
        alert("Movie deleted successfully");
      } else {
        alert(response.message || "Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
      alert(err.message || "Failed to delete movie");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading movies...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">⚠️ {error}</p>
          <button onClick={fetchMovies} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-950 text-2xl font-bold">Movies Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all movies in the system</p>
        </div>
        <Link to="/admin/movies/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Add Movie
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Thumbnail</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Genre</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Age</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-950">
                    <img src={movie.thumbnail} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">{movie.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{movie.genres?.join(", ") || "-"}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{movie.duration} min</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{movie.ageRating || "-"}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${movie.status === "now-showing" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"}`}>
                      {movie.status === "now-showing" ? "Now Showing" : "Coming Soon"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex gap-2">
                      <Link to={`/admin/movies/${movie.id}/edit`} className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(movie.id)} className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No movies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
