const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getTipeHari } = require("../utils/dateHelper");
/**
 * Helper function to format jadwal data
 * Converts Date objects to readable strings
 */
const formatJadwal = (jadwal) => {
  if (!jadwal) return null;

  return {
    ...jadwal,
    tanggal: jadwal.tanggal ? jadwal.tanggal.toISOString().split("T")[0] : null,
    jam_mulai: jadwal.jam_mulai ? jadwal.jam_mulai.toTimeString().slice(0, 5) : null,
    jam_selesai: jadwal.jam_selesai ? jadwal.jam_selesai.toTimeString().slice(0, 5) : null,
  };
};

/**
 * Helper function to format multiple jadwal
 */
const formatJadwals = (jadwals) => {
  return jadwals.map(formatJadwal);
};

/**
 * Get all jadwal with filters
 */
const getAllJadwal = async (req, res) => {
  try {
    const { id_film, id_studio, id_cabang, tanggal } = req.query;

    const jadwals = await prisma.jadwal.findMany({
      where: {
        ...(id_film && { id_film: parseInt(id_film) }),
        ...(id_studio && { id_studio: parseInt(id_studio) }),
        ...(id_cabang && {
          studio: { id_cabang: parseInt(id_cabang) },
        }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
      },
      include: {
        film: true,
        studio: {
          include: {
            cabang: true,
            tipeStudio: true,
          },
        },
        _count: {
          select: { statusKursis: true },
        },
      },
      orderBy: [{ tanggal: "asc" }, { jam_mulai: "asc" }],
    });

    const result = [];

    for (const jadwal of jadwals) {
      // 1️⃣ Tentukan tipe hari
      const tipeHariStr = getTipeHari(jadwal.tanggal);

      // 2️⃣ Ambil master tipe hari
      const tipeHari = await prisma.tipeHari.findFirst({
        where: { tipe_hari: tipeHariStr },
      });

      if (!tipeHari) {
        return res.status(500).json({
          success: false,
          message: `Tipe hari '${tipeHariStr}' belum diset`,
        });
      }

      // 3️⃣ Cari aturan harga
      const aturanHarga = await prisma.aturanHarga.findFirst({
        where: {
          id_cabang: jadwal.studio.id_cabang,
          id_tipe_studio: jadwal.studio.id_tipe_studio,
          id_tipe_hari: tipeHari.id_tipe_hari,
        },
      });

      result.push({
        ...formatJadwal(jadwal),
        harga_tiket: aturanHarga ? Number(aturanHarga.harga) : null,
        tipe_hari: tipeHariStr,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching jadwal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jadwal",
      error: error.message,
    });
  }
};

/**
 * Get jadwal by ID with seat availability
 */
const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: parseInt(id) },
      include: {
        film: true,
        studio: {
          include: {
            cabang: true,
            tipeStudio: true,
            kursis: true,
          },
        },
        statusKursis: {
          include: {
            kursi: true,
          },
        },
      },
    });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal not found",
      });
    }

    // 🔹 HITUNG TIPE HARI
    const tipeHariStr = getTipeHari(jadwal.tanggal);

    // 🔹 AMBIL ID TIPE HARI
    const tipeHari = await prisma.tipeHari.findFirst({
      where: { tipe_hari: tipeHariStr },
    });

    if (!tipeHari) {
      return res.status(404).json({
        success: false,
        message: "Tipe hari tidak ditemukan",
      });
    }

    // 🔹 AMBIL ATURAN HARGA
    const aturanHarga = await prisma.aturanHarga.findFirst({
      where: {
        id_cabang: jadwal.studio.id_cabang,
        id_tipe_studio: jadwal.studio.id_tipe_studio,
        id_tipe_hari: tipeHari.id_tipe_hari,
      },
    });

    const harga = aturanHarga ? aturanHarga.harga : null;

    // 🔹 HITUNG SEAT
    const totalSeats = jadwal.studio.kursis.length;
    const occupiedSeats = jadwal.statusKursis.filter((s) => s.status_kursi !== "TERSEDIA").length;

    res.json({
      success: true,
      data: {
        ...formatJadwal(jadwal),
        tipe_hari: tipeHariStr,
        harga_tiket: harga,
        seatAvailability: {
          total: totalSeats,
          available: totalSeats - occupiedSeats,
          occupied: occupiedSeats,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jadwal",
      error: error.message,
    });
  }
};

/**
 * Create new jadwal (Admin only)
 * Supports multiple time slots in a single request
 * This will automatically create StatusKursi for all seats in the studio
 */
const createJadwal = async (req, res) => {
  try {
    const { id_film, id_studio, tanggal, jam_tayang } = req.body;

    // Validation
    if (!id_film || !id_studio || !tanggal) {
      return res.status(400).json({
        success: false,
        message: "Required fields: id_film, id_studio, tanggal",
      });
    }

    // Support both single time slot (jam_mulai, jam_selesai) and multiple time slots (jam_tayang array)
    let timeSlots = [];

    if (jam_tayang && Array.isArray(jam_tayang) && jam_tayang.length > 0) {
      // Multiple time slots mode
      timeSlots = jam_tayang;
    } else if (req.body.jam_mulai && req.body.jam_selesai) {
      // Single time slot mode (backward compatibility)
      timeSlots = [
        {
          jam_mulai: req.body.jam_mulai,
          jam_selesai: req.body.jam_selesai,
        },
      ];
    } else {
      return res.status(400).json({
        success: false,
        message: "Either jam_tayang array or jam_mulai & jam_selesai are required",
      });
    }

    // Get all kursi for the studio
    const kursis = await prisma.kursi.findMany({
      where: { id_studio: parseInt(id_studio) },
    });

    if (kursis.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Studio has no seats. Please create seats first.",
      });
    }

    // Parse tanggal correctly (YYYY-MM-DD format)
    // Split the date string and create date in local timezone
    const [year, month, day] = tanggal.split("-").map(Number);
    const tanggalDate = new Date(year, month - 1, day);

    // Check for conflicts with existing jadwal
    const conflicts = [];

    for (const slot of timeSlots) {
      const existingJadwal = await prisma.jadwal.findFirst({
        where: {
          id_studio: parseInt(id_studio),
          tanggal: tanggalDate,
          jam_mulai: new Date(`${tanggal}T${slot.jam_mulai}`),
        },
      });

      if (existingJadwal) {
        conflicts.push({
          jam_mulai: slot.jam_mulai,
          message: `Time slot ${slot.jam_mulai} already exists for this studio on this date`,
        });
      }
    }

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some time slots conflict with existing schedules",
        conflicts: conflicts,
      });
    }

    // Create multiple jadwal in a transaction
    const createdJadwals = await prisma.$transaction(async (tx) => {
      const jadwals = [];

      for (const slot of timeSlots) {
        const jadwal = await tx.jadwal.create({
          data: {
            id_film: parseInt(id_film),
            id_studio: parseInt(id_studio),
            tanggal: new Date(tanggal + "T00:00:00.000Z"),
            jam_mulai: new Date(`${tanggal}T${slot.jam_mulai}`),
            jam_selesai: new Date(`${tanggal}T${slot.jam_selesai}`),
            statusKursis: {
              createMany: {
                data: kursis.map((kursi) => ({
                  id_kursi: kursi.id_kursi,
                  status_kursi: "TERSEDIA",
                })),
              },
            },
          },
          include: {
            film: true,
            studio: {
              include: {
                cabang: true,
                tipeStudio: true,
              },
            },
            _count: {
              select: { statusKursis: true },
            },
          },
        });

        jadwals.push(jadwal);
      }

      return jadwals;
    });

    res.status(201).json({
      success: true,
      message: `${createdJadwals.length} jadwal(s) created successfully with ${kursis.length} seat statuses each`,
      data: formatJadwals(createdJadwals),
      count: createdJadwals.length,
    });
  } catch (error) {
    console.error("Error creating jadwal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create jadwal",
      error: error.message,
    });
  }
};

/**
 * Update jadwal (Admin only)
 */
const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, jam_mulai, jam_selesai } = req.body;

    const jadwal = await prisma.jadwal.update({
      where: { id_jadwal: parseInt(id) },
      data: {
        ...(tanggal && { tanggal: new Date(tanggal + "T00:00:00.000Z") }),
        ...(jam_mulai && { jam_mulai: new Date(`${tanggal}T${jam_mulai}`) }),
        ...(jam_selesai && { jam_selesai: new Date(`${tanggal}T${jam_selesai}`) }),
      },
      include: {
        film: true,
        studio: {
          include: {
            cabang: true,
            tipeStudio: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Jadwal updated successfully",
      data: formatJadwal(jadwal),
    });
  } catch (error) {
    console.error("Error updating jadwal:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Jadwal not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update jadwal",
      error: error.message,
    });
  }
};

/**
 * Delete jadwal (Admin only)
 */
const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.jadwal.delete({
      where: { id_jadwal: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Jadwal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting jadwal:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Jadwal not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete jadwal",
      error: error.message,
    });
  }
};

module.exports = {
  getAllJadwal,
  getJadwalById,
  createJadwal,
  updateJadwal,
  deleteJadwal,
};
