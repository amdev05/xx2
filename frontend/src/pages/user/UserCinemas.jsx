import { useState, useEffect } from "react";

// Components
import { CinemaCard } from "../../components/ui/Card";
import { SearchFilter } from "../../components/ui/Search";

// Services
import cinemaService from "../../services/cinemaService";

function UserCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await cinemaService.getAll();
      setCinemas(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load cinemas");
      console.error("Error fetching cinemas:", err);
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
          <p className="text-red-500 mb-2">Error loading cinemas</p>
          <p className="text-tx-light/50 text-sm">{error}</p>
          <button 
            onClick={fetchCinemas}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-175 mx-auto my-container">
      <h1 className=" mt-5 md:mt-10">Bioskop</h1>

      <SearchFilter classname="mt-4" />

      <section className=" mt-4 ">
        {cinemas.length > 0 ? (
          cinemas.map((data) => (
            <CinemaCard data={data} key={data.id} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-tx-light/50">No cinemas available</p>
          </div>
        )}
      </section>
    </div>
  );
}
export default UserCinemas;

