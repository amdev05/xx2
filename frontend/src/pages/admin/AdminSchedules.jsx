import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import cinemaService from "../../services/cinemaService";
import scheduleService from "../../services/scheduleService";

export default function AdminSchedules() {
  const [cinemas, setCinemas] = useState([]);
  const [scheduleStats, setScheduleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all cinemas
        const cinemasResponse = await cinemaService.getAll();
        const cinemasData = cinemasResponse.data || [];
        setCinemas(cinemasData);

        // Fetch schedule stats for each cinema
        const stats = {};
        for (const cinema of cinemasData) {
          try {
            const schedulesResponse = await scheduleService.getAll({ id_cabang: cinema.id });
            const schedules = schedulesResponse.data || [];

            const today = new Date();
            const todayStr = today.toISOString().split("T")[0];

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];

            const todaySchedules = schedules.filter((s) => s.date === todayStr);
            const tomorrowSchedules = schedules.filter((s) => s.date === tomorrowStr);

            stats[cinema.id] = {
              total: schedules.length,
              today: todaySchedules.length,
              tomorrow: tomorrowSchedules.length,
            };
          } catch (err) {
            console.error(`Error fetching schedules for cinema ${cinema.id}:`, err);
            stats[cinema.id] = { total: 0, today: 0, tomorrow: 0 };
          }
        }
        setScheduleStats(stats);
      } catch (err) {
        setError(err.message || "Failed to fetch cinemas");
        console.error("Error fetching cinemas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-950 text-2xl font-bold">Schedules Management</h1>
        <p className="text-sm text-gray-600 mt-1">Select a cinema to manage its showtimes and schedules</p>
      </div>

      {cinemas.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600">No cinemas found. Add a cinema first to create schedules.</p>
          <Link to="/admin/cinemas" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Go to Cinemas
          </Link>
        </div>
      ) : (
        <>
          {/* Cinema Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemas.map((cinema) => (
              <Link key={cinema.id} to={`/admin/schedules/cinema/${cinema.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary/50 transition-all group">
                {/* Cinema Info */}
                <div className="p-6">
                  <h3 className="text-gray-950 text-lg font-bold group-hover:text-primary transition-colors">{cinema.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{cinema.address}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Active Today</p>
                      <p className="text-2xl text-gray-950 font-bold text-primary">{scheduleStats[cinema.id]?.today || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tomorrow</p>
                      <p className="text-2xl text-gray-950 font-bold text-green-500">{scheduleStats[cinema.id]?.tomorrow || 0}</p>
                    </div>
                  </div>

                  {/* Action Hint */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                    <span>Manage Schedules</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
                      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 6s6 4.419 6 6s-6 6-6 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-gray-950 text-lg font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Cinemas</p>
                <p className="text-3xl text-gray-950 font-bold text-primary">{cinemas.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-3xl text-gray-950 font-bold text-primary">{Object.values(scheduleStats).reduce((sum, s) => sum + (s.today || 0), 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tomorrow</p>
                <p className="text-3xl text-gray-950 font-bold text-green-500">{Object.values(scheduleStats).reduce((sum, s) => sum + (s.tomorrow || 0), 0)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
