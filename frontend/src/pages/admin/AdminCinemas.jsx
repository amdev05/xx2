import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import cinemaService from "../../services/cinemaService";
import defaultCinemaImage from "../../assets/images/cinema1.png";

export default function AdminCinemas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cinemas from backend
  const fetchCinemas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cinemaService.getAll();
      if (response.success) {
        // Map studios to calculate counts
        const cinemasWithCounts = response.data.map((cinema) => ({
          ...cinema,
          totalStudios: cinema.studios?.length || 0,
          studioTypes: [...new Set(cinema.studios?.map((s) => s.studioType).filter(Boolean))] || [],
        }));
        setCinemas(cinemasWithCounts);
      } else {
        setError(response.message || "Failed to fetch cinemas");
      }
    } catch (err) {
      console.error("Error fetching cinemas:", err);
      setError(err.message || "Failed to load cinemas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all its studios.`)) {
      return;
    }

    try {
      const response = await cinemaService.delete(id);
      if (response.success) {
        setCinemas(cinemas.filter((c) => c.id !== id));
        alert("Cinema deleted successfully");
      } else {
        alert(response.message || "Failed to delete cinema");
      }
    } catch (err) {
      console.error("Error deleting cinema:", err);
      alert(err.message || "Failed to delete cinema");
    }
  };

  const filteredCinemas = cinemas.filter((cinema) => cinema.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading cinemas...</p>
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
          <button onClick={fetchCinemas} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
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
          <h1 className="text-gray-950 text-2xl font-bold">Cinemas Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage cinema locations and studios</p>
        </div>
        <Link to="/admin/cinemas/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Add Cinema
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <input
          type="text"
          placeholder="Search cinemas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Cinemas Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Image</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Studio Types</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Studios</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCinemas.map((cinema) => (
                <tr key={cinema.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-950">
                    <img src={cinema.image || defaultCinemaImage} alt={cinema.name} className="w-16 h-12 object-cover rounded" />
                  </td>
                  <td className="py-3 px-4 text-gray-950">
                    <Link to={`/admin/cinemas/${cinema.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                      {cinema.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate">{cinema.address}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex gap-1 flex-wrap">
                      {cinema.studioTypes.map((type) => (
                        <span key={type} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{cinema.totalStudios}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex gap-2">
                      <Link to={`/admin/cinemas/${cinema.id}`} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors">
                        View Studios
                      </Link>
                      <Link to={`/admin/cinemas/${cinema.id}/edit`} className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(cinema.id, cinema.name)} className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCinemas.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No cinemas found</p>
          </div>
        )}
      </div>
    </div>
  );
}
