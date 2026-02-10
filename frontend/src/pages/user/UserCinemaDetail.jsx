import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import HeroCinema from "../../components/user/HeroCinema";
import { DateSlider } from "../../components/user/DateSlider";
import { SearchFilter } from "../../components/ui/Search";
import { MovieScheduleCard } from "../../components/ui/Card";

// Services
import cinemaService from "../../services/cinemaService";

// Assets
import defaultCinemaImage from "../../assets/images/cinema1.png";

function UserCinemaDetail() {
  const { id } = useParams();
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActive, setTabActive] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const fetchCinemaDetail = async () => {
    try {
      setLoading(true);
      const response = await cinemaService.getById(id);

      // Transform data for components
      const cinemaData = {
        id: response.data.id,
        name: response.data.name,
        address: response.data.address,
        image: response.data.image || defaultCinemaImage,
        studios: response.data.studios || [],
        studio_type: response.data.studioTypes || [],
        movies: [], // Will be populated from schedules if needed
      };

      setCinema(cinemaData);
    } catch (err) {
      setError(err.message || "Failed to load cinema details");
      console.error("Error fetching cinema:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemaDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading cinema details</p>
          <p className="text-tx-light/50 text-sm">{error}</p>
          <button onClick={fetchCinemaDetail} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="h-[80dvh] md:h-dvh w-full">
        <HeroCinema data={cinema} />
      </section>

      <div id="schedule" className="max-w-175 mx-auto pt-13">
        <div className="my-container space-y-3">
          <p className="text-lg font-semibold space-x-6">
            <span className={`cursor-pointer ${tabActive == 0 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(0)}>
              Jadwal
            </span>
            <span className={`cursor-pointer ${tabActive == 1 ? "" : "text-tx-light/50"}`} onClick={() => setTabActive(1)}>
              Detail
            </span>
          </p>
          <hr className="border-light/25" />
        </div>
      </div>

      {tabActive == 0 && (
        <section className="my-container max-w-175 mx-auto py-5 space-y-5 md:space-y-6">
          <DateSlider />

          <SearchFilter searchValue={searchValue} onSearchValue={setSearchValue} filterValue={filterValue} onFilterValue={setFilterValue} />

          <div className="">
            {cinema.movies && cinema.movies.length > 0 ? (
              cinema.movies.map((movie) => <MovieScheduleCard data={movie} key={movie.id} />)
            ) : (
              <div className="text-center py-10">
                <p className="text-tx-light/50">No movie schedules available for this cinema</p>
              </div>
            )}
          </div>
        </section>
      )}

      {tabActive == 1 && (
        <section className="my-container max-w-175 mx-auto py-5">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Cinema Information</h2>
              <p className="text-sm mt-2 text-tx-light/75">Name: {cinema.name}</p>
              <p className="text-sm text-tx-light/75">Address: {cinema.address}</p>
              <p className="text-sm text-tx-light/75">Total Studios: {cinema.studios.length}</p>
            </div>

            {cinema.studios.length > 0 && (
              <div className="border-t border-light/25 pt-4">
                <h3 className="font-semibold">Studios</h3>
                <div className="mt-2 space-y-2">
                  {cinema.studios.map((studio, index) => (
                    <div key={index} className="text-sm text-tx-light/75">
                      <span className="font-medium">Studio {studio.studioNumber}</span>
                      {studio.studioType && <span> - {studio.studioType}</span>}
                      {studio.capacity && <span> (Capacity: {studio.capacity})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default UserCinemaDetail;
