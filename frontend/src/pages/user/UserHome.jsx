import { useState, useEffect } from "react";
import CardSlider from "../../components/user/CardSlider";
import Hero from "../../components/layout/user/Hero";
import StudioTypeCard from "../../components/layout/user/StudioTypeCard";
import movieService from "../../services/movieService";

import nextCircleOutlineIcon from "../../assets/icons/nextCircleOutlineIcon.svg";
import prevCircleOutlineIcon from "../../assets/icons/prevCircleOutlineIcon.svg";

import { STUDIOTYPE } from "../../assets/index";

function UserHome() {
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
      setFilms(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load films");
      console.error("Error fetching films:", err);
    } finally {
      setLoading(false);
    }
  };

  // console.log(films);

  // Filter films by release date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nowShowingFilms = films.filter((film) => {
    if (!film.releaseDate) return false;
    const releaseDate = new Date(film.releaseDate);
    return releaseDate <= today;
  });

  const comingSoonFilms = films.filter((film) => {
    if (!film.releaseDate) return false;
    const releaseDate = new Date(film.releaseDate);
    return releaseDate > today;
  });

  // Transform films to match component expected format
  const transformFilmForDisplay = (film) => ({
    id: film.id,
    title: film.title,
    genre: Array.isArray(film.genres) ? film.genres : film.genre ? film.genre.split(",").map((g) => g.trim()) : [],
    ageRating: film.ageRating,
    duration: film.duration,
    image: film.thumbnail, // CardSlider expects 'image'
    poster: film.poster, // Some components expect 'poster'
    thumbnail: film.thumbnail, // Hero expects 'thumbnail'
    logo: film.logo,
    trailer: film.trailer,
    synopsis: film.synopsis,
    releaseDate: film.releaseDate,
  });

  const heroData = nowShowingFilms.slice(0, 5).map(transformFilmForDisplay);
  const nowShowingData = nowShowingFilms.map(transformFilmForDisplay);
  const comingSoonData = comingSoonFilms.map(transformFilmForDisplay);

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
          <p className="text-red-500 mb-2">Error loading films</p>
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
      {/* Hero Section - Now Showing Films */}
      {heroData.length > 0 ? (
        <Hero data={heroData} />
      ) : (
        <div className="h-96 bg-card-dark flex items-center justify-center">
          <p className="text-tx-light/50">No films currently showing</p>
        </div>
      )}

      {/* Now Showing Section */}
      <section className="mt-13 md:mt-10">
        <div className="my-container flex justify-between items-center">
          <h2 className="text-lg font-bold">Sedang Tayang</h2>
          {nowShowingData.length > 0 && (
            <div className="flex gap-2">
              <img src={prevCircleOutlineIcon} alt="prev button" className="nowshowing-prev size-8 md:size-9" />
              <img src={nextCircleOutlineIcon} alt="next button" className="nowshowing-next size-8 md:size-9" />
            </div>
          )}
        </div>
        {nowShowingData.length > 0 ? (
          <CardSlider datacard={nowShowingData} navigation={{ nextEl: ".nowshowing-next", prevEl: ".nowshowing-prev" }} />
        ) : (
          <div className="my-container py-8 text-center">
            <p className="text-tx-light/50">No films currently showing</p>
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="mt-13 md:mt-10">
        <div className="my-container flex justify-between items-center">
          <h2 className="text-lg font-bold">Segera Tayang</h2>
          {comingSoonData.length > 0 && (
            <div className="flex gap-2">
              <img src={prevCircleOutlineIcon} alt="prev button" className="comingsoon-prev size-8 md:size-9" />
              <img src={nextCircleOutlineIcon} alt="next button" className="comingsoon-next size-8 md:size-9" />
            </div>
          )}
        </div>
        {comingSoonData.length > 0 ? (
          <CardSlider datacard={comingSoonData} navigation={{ nextEl: ".comingsoon-next", prevEl: ".comingsoon-prev" }} />
        ) : (
          <div className="my-container py-8 text-center">
            <p className="text-tx-light/50">No upcoming films</p>
          </div>
        )}
      </section>

      {/* Studio Types Section */}
      <section className="mt-13 md:mt-10">
        <div className="my-container flex justify-between items-center">
          <h2 className="text-lg font-bold">Tipe Studio XX2</h2>
          <div className="flex gap-2 lg:hidden">
            <img src={prevCircleOutlineIcon} alt="prev button" className="studiotype-prev size-8 md:size-9" />
            <img src={nextCircleOutlineIcon} alt="next button" className="studiotype-next size-8 md:size-9" />
          </div>
        </div>
        <StudioTypeCard datacard={STUDIOTYPE} navigation={{ nextEl: ".studiotype-next", prevEl: ".studiotype-prev" }} />
      </section>
    </>
  );
}

export default UserHome;
