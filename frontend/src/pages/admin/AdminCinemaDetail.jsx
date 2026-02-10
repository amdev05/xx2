import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import cinemaService from "../../services/cinemaService";
import studioService from "../../services/studioService";
import defaultCinemaImage from "../../assets/images/cinema1.png";

export default function AdminCinemaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cinema, setCinema] = useState(null);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cinema details
      const cinemaRes = await cinemaService.getById(id);
      if (cinemaRes.success) {
        setCinema(cinemaRes.data);
        // Studios are included in cinema data
        setStudios(cinemaRes.data.studios || []);
      } else {
        setError(cinemaRes.message || "Failed to load cinema");
      }
    } catch (err) {
      console.error("Error fetching cinema:", err);
      setError(err.message || "Failed to load cinema");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteStudio = async (studioId, studioNumber) => {
    if (!confirm(`Are you sure you want to delete Studio ${studioNumber}? This will also delete all its seats.`)) {
      return;
    }

    try {
      const response = await studioService.delete(studioId);
      if (response.success) {
        setStudios(studios.filter((s) => s.id !== studioId));
        alert("Studio deleted successfully");
      } else {
        alert(response.message || "Failed to delete studio");
      }
    } catch (err) {
      console.error("Error deleting studio:", err);
      alert(err.message || "Failed to delete studio");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading cinema details...</p>
        </div>
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">⚠️ {error || "Cinema not found"}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mr-2">
            Retry
          </button>
          <Link to="/admin/cinemas" className="px-4 py-2 bg-gray-100 text-white rounded-lg hover:bg-gray-200 inline-block">
            Back to Cinemas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link to="/admin/cinemas" className="text-gray-600 hover:text-gray-950 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="inline-block"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 6s-6 4.419-6 6s6 6 6 6" /></svg> Back to Cinemas
        </Link>
      </div>

      {/* Cinema Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-3">
          <div className="md:col-span-1">
            <img src={cinema.image || defaultCinemaImage} alt={cinema.name} className="w-full h-full object-cover min-h-48" />
          </div>
          <div className="md:col-span-2 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-gray-950 text-2xl font-bold">{cinema.name}</h1>
                <p className="text-sm text-gray-700 mt-2">{cinema.address}</p>
              </div>
              <Link to={`/admin/cinemas/${id}/edit`} className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-medium text-sm">
                Edit Cinema
              </Link>
            </div>

            {cinema.studio_type && cinema.studio_type.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-950 font-medium text-gray-600 mb-2">Available Studio Types:</p>
                <div className="flex gap-2 flex-wrap">
                  {cinema.studio_type.map((type) => (
                    <span key={type} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Studios</p>
                  <p className="text-lg text-gray-950 font-bold">{studios.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Capacity</p>
                  <p className="text-lg text-gray-950 font-bold">{studios.reduce((sum, s) => sum + (s.capacity || 0), 0)} seats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studios Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-950 text-xl font-bold">Studios</h2>
            <p className="text-sm text-gray-600 mt-1">Manage studios and seat configurations</p>
          </div>
          <Link to={`/admin/cinemas/${id}/studios/new`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            + Add Studio
          </Link>
        </div>

        {/* Studios Grid */}
        {studios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studios.map((studio) => {
              // Calculate rows and seats per row from seats array if available
              const seats = studio.seats || [];
              const uniqueRows = [...new Set(seats.map((s) => s.row))].sort();
              const seatsInFirstRow = seats.filter((s) => s.row === uniqueRows[0]).length;

              return (
                <div key={studio.id} className="text-gray-950 bg-gray-100 border border-gray-200 rounded-lg p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-950 text-lg font-bold">Studio {studio.studioNumber}</h3>
                      <p className="text-sm text-gray-600">{studio.studioType || "N/A"}</p>
                    </div>
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">{studio.studioType || "N/A"}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {uniqueRows.length > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rows:</span>
                          <span className="font-medium">
                            {uniqueRows.length} ({uniqueRows[0]}-{uniqueRows[uniqueRows.length - 1]})
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Seats per Row:</span>
                          <span className="font-medium">{seatsInFirstRow}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Total Capacity:</span>
                      <span className="font-bold text-primary">{studio.capacity || seats.length} seats</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/cinemas/${id}/studios/${studio.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudio(studio.id, studio.studioNumber)}
                      className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg mb-2">No studios yet</p>
            <p className="text-sm text-gray-950">Click "Add Studio" to create your first studio</p>
          </div>
        )}
      </div>
    </div>
  );
}
