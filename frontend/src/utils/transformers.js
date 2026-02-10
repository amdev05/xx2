// Data transformation utilities for backend <-> frontend mapping

/**
 * Transform film data from backend to frontend format
 */
export const transformFilmFromBackend = (backendFilm) => {
  if (!backendFilm) return null;

  return {
    id: backendFilm.id_film,
    title: backendFilm.nama_film,
    duration: backendFilm.durasi,
    genres: backendFilm.genre ? backendFilm.genre.split(", ") : [],
    ageRating: backendFilm.batas_umur,
    poster: backendFilm.poster_url,
    thumbnail: backendFilm.thumbnail_url || backendFilm.poster_url,
    logo: backendFilm.logo_url,
    trailer: backendFilm.trailer_url,
    synopsis: backendFilm.synopsis,
    releaseDate: backendFilm.tanggal_rilis,
    // Cast and crew are separate relations in backend
    cast:
      backendFilm.casts
        ?.filter((c) => c.type === "CAST")
        .map((c) => ({
          name: c.name,
          role: c.role,
          image: c.image_url,
        })) || [],
    crew:
      backendFilm.casts
        ?.filter((c) => c.type === "CREW")
        .map((c) => ({
          name: c.name,
          role: c.role,
        })) || [],
    production: backendFilm.productions?.[0] || null,
  };
};

/**
 * Transform film data from frontend to backend format
 */
export const transformFilmToBackend = (frontendFilm) => {
  return {
    nama_film: frontendFilm.title,
    durasi: parseInt(frontendFilm.duration),
    genre: Array.isArray(frontendFilm.genres) ? frontendFilm.genres.join(", ") : frontendFilm.genres,
    batas_umur: frontendFilm.ageRating,
    poster_url: frontendFilm.thumbnail,
    thumbnail_url: frontendFilm.thumbnail,
    logo_url: frontendFilm.logo,
    trailer_url: frontendFilm.trailer,
    synopsis: frontendFilm.synopsis,
    tanggal_rilis: frontendFilm.releaseDate,
  };
};

/**
 * Transform cabang (cinema) from backend to frontend
 */
export const transformCinemaFromBackend = (backendCabang) => {
  if (!backendCabang) return null;

  // Extract unique studio types
  const studioTypes = backendCabang.studios ? [...new Set(backendCabang.studios.map((s) => s.tipeStudio?.tipe_studio).filter(Boolean))] : [];

  return {
    id: backendCabang.id_cabang,
    name: backendCabang.nama_cabang,
    address: backendCabang.alamat,
    studios: backendCabang.studios?.map(transformStudioFromBackend) || [],
    studio_type: studioTypes,
    favorite: false, // Default value for favorite
  };
};

/**
 * Transform cinema from frontend to backend
 */
export const transformCinemaToBackend = (frontendCinema) => {
  return {
    nama_cabang: frontendCinema.name,
    alamat: frontendCinema.address,
  };
};

/**
 * Transform studio from backend to frontend
 */
export const transformStudioFromBackend = (backendStudio) => {
  if (!backendStudio) return null;

  return {
    id: backendStudio.id_studio,
    cinemaId: backendStudio.id_cabang,
    studioNumber: backendStudio.no_studio,
    studioTypeId: backendStudio.id_tipe_studio,
    studioType: backendStudio.tipeStudio?.tipe_studio,
    capacity: backendStudio.kapasitas_total,
    seats: backendStudio.kursis?.map(transformSeatFromBackend) || [],
  };
};

/**
 * Transform studio from frontend to backend
 */
export const transformStudioToBackend = (frontendStudio) => {
  return {
    id_cabang: frontendStudio.cinemaId,
    no_studio: frontendStudio.studioNumber,
    id_tipe_studio: frontendStudio.studioTypeId,
    kapasitas_total: frontendStudio.capacity || 0,
  };
};

/**
 * Transform seat from backend to frontend
 */
export const transformSeatFromBackend = (backendKursi) => {
  if (!backendKursi) return null;

  return {
    id: backendKursi.id_kursi,
    studioId: backendKursi.id_studio,
    row: backendKursi.row_kursi,
    number: backendKursi.no_kursi,
    label: `${backendKursi.row_kursi}${backendKursi.no_kursi}`,
  };
};

/**
 * Transform tipe studio from backend to frontend
 */
export const transformStudioTypeFromBackend = (backendTipeStudio) => {
  if (!backendTipeStudio) return null;

  return {
    id: backendTipeStudio.id_tipe_studio,
    name: backendTipeStudio.tipe_studio,
    description: backendTipeStudio.deskripsi,
  };
};

/**
 * Transform studio type from frontend to backend
 */
export const transformStudioTypeToBackend = (frontendType) => {
  return {
    tipe_studio: frontendType.name,
    deskripsi: frontendType.description,
  };
};

/**
 * Transform jadwal (schedule) from backend to frontend
 */
export const transformScheduleFromBackend = (backendJadwal) => {
  if (!backendJadwal) return null;

  // TEMPORARY: Force all seats to be available for testing
  const totalSeats = backendJadwal.studio?.kursis?.length || backendJadwal.statusKursis?.length || 160;

  // Calculate seat availability (temporarily force all available)
  // const totalSeats = backendJadwal.statusKursis?.length || 0;
  // const availableSeats = backendJadwal.statusKursis?.filter((sk) => sk.status_kursi === "TERSEDIA").length || 0;
  // const occupiedSeats = totalSeats - availableSeats;

  const availableSeats = totalSeats; // Force all available
  const occupiedSeats = 0; // Force none occupied

  return {
    id: backendJadwal.id_jadwal,
    movieId: backendJadwal.id_film,
    movieTitle: backendJadwal.film?.nama_film,
    movieDuration: backendJadwal.film?.durasi,
    studioId: backendJadwal.id_studio,
    cinemaId: backendJadwal.studio?.id_cabang,
    cinemaName: backendJadwal.studio?.cabang?.nama_cabang,
    studioNumber: backendJadwal.studio?.no_studio,
    studioType: backendJadwal.studio?.tipeStudio?.tipe_studio,
    date: backendJadwal.tanggal,
    startTime: backendJadwal.jam_mulai,
    endTime: backendJadwal.jam_selesai,
    price: backendJadwal.harga_tiket ? parseFloat(backendJadwal.harga_tiket) : null,
    dayType: backendJadwal.tipe_hari,
    seatAvailability: {
      total: totalSeats,
      available: availableSeats,
      occupied: occupiedSeats,
    },
    studio: backendJadwal.studio
      ? {
          id: backendJadwal.studio.id_studio,
          name: backendJadwal.studio.nama_studio || `Studio ${backendJadwal.studio.no_studio}`,
          number: backendJadwal.studio.no_studio,
          cabang: backendJadwal.studio.cabang
            ? {
                id_cabang: backendJadwal.studio.cabang.id_cabang,
                nama_cabang: backendJadwal.studio.cabang.nama_cabang,
                alamat: backendJadwal.studio.cabang.alamat,
              }
            : null,
          tipeStudio: backendJadwal.studio.tipeStudio
            ? {
                id_tipe_studio: backendJadwal.studio.tipeStudio.id_tipe_studio,
                nama_tipe: backendJadwal.studio.tipeStudio.tipe_studio,
              }
            : null,
          kursis: backendJadwal.studio.kursis || [],
        }
      : null,
    film: backendJadwal.film
      ? {
          id_film: backendJadwal.film.id_film,
          title: backendJadwal.film.nama_film,
          poster: backendJadwal.film.poster_url,
          duration: backendJadwal.film.durasi,
        }
      : null,
    statusKursis: backendJadwal.statusKursis || [],
  };
};

/**
 * Transform schedule from frontend to backend
 */
export const transformScheduleToBackend = (frontendSchedule) => {
  return {
    id_film: frontendSchedule.movieId,
    id_studio: frontendSchedule.studioId,
    tanggal: frontendSchedule.date,
    jam_mulai: frontendSchedule.startTime,
    jam_selesai: frontendSchedule.endTime,
  };
};

/**
 * Transform aturan harga (pricing rule) from backend to frontend
 */
export const transformPricingFromBackend = (backendAturanHarga) => {
  if (!backendAturanHarga) return null;

  return {
    id: backendAturanHarga.id_harga,
    cinemaId: backendAturanHarga.id_cabang,
    cinemaName: backendAturanHarga.cabang?.nama_cabang,
    studioTypeId: backendAturanHarga.id_tipe_studio,
    studioType: backendAturanHarga.tipeStudio?.tipe_studio,
    dayTypeId: backendAturanHarga.id_tipe_hari,
    dayType: backendAturanHarga.tipeHari?.tipe_hari,
    price: parseFloat(backendAturanHarga.harga),
  };
};

/**
 * Transform pricing from frontend to backend
 */
export const transformPricingToBackend = (frontendPricing) => {
  return {
    id_cabang: frontendPricing.cinemaId,
    id_tipe_studio: frontendPricing.studioTypeId,
    id_tipe_hari: frontendPricing.dayTypeId,
    harga: frontendPricing.price,
  };
};

/**
 * Transform tipe hari (day type) from backend to frontend
 */
export const transformDayTypeFromBackend = (backendTipeHari) => {
  if (!backendTipeHari) return null;

  return {
    id: backendTipeHari.id_tipe_hari,
    name: backendTipeHari.tipe_hari,
    description: backendTipeHari.deskripsi,
  };
};

/**
 * Transform ticket/booking from backend to frontend
 */
export const transformTicketFromBackend = (backendTiket) => {
  if (!backendTiket) return null;

  return {
    id: backendTiket.id_tiket,
    code: backendTiket.kode_tiket,
    orderId: backendTiket.id_order,
    movieTitle: backendTiket.jadwal?.film?.nama_film,
    cinema: backendTiket.jadwal?.studio?.cabang?.nama_cabang,
    studio: backendTiket.jadwal?.studio?.no_studio,
    date: backendTiket.jadwal?.tanggal,
    time: backendTiket.jadwal?.jam_mulai,
    seat: `${backendTiket.kursi?.row_kursi}${backendTiket.kursi?.no_kursi}`,
    price: parseFloat(backendTiket.harga_final),
    status: backendTiket.status_tiket, // PENDING, CONFIRMED, CANCELLED
    purchaseTime: backendTiket.waktu_pembelian,
  };
};
