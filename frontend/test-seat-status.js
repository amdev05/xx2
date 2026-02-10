// Simple Node.js script to test the seat status logic
// Run with: node test-seat-status.js

// Simulate the backend response
const backendResponse = {
  success: true,
  data: {
    id_jadwal: 100,
    tanggal: "2026-01-27",
    jam_mulai: "12:00",
    jam_selesai: "13:18",
    harga_tiket: 50000,
    tipe_hari: "Weekday",
    film: {
      id_film: 52,
      nama_film: "Zootopia 2",
      poster_url: "https://example.com/poster.jpg",
      durasi: 78,
    },
    studio: {
      id_studio: 1,
      no_studio: "1",
      cabang: {
        id_cabang: 1,
        nama_cabang: "Summarecon Mall Bandung XX2",
      },
      tipeStudio: {
        id_tipe_studio: 1,
        tipe_studio: "Regular",
      },
      kursis: [
        { id_kursi: 2941, row_kursi: "A", no_kursi: 1 },
        { id_kursi: 2942, row_kursi: "A", no_kursi: 2 },
        { id_kursi: 2943, row_kursi: "A", no_kursi: 3 },
      ],
    },
    statusKursis: [
      { id_status_kursi: 28699, id_jadwal: 100, id_kursi: 2941, status_kursi: "TERSEDIA" },
      { id_status_kursi: 28700, id_jadwal: 100, id_kursi: 2942, status_kursi: "TERSEDIA" },
      { id_status_kursi: 28701, id_jadwal: 100, id_kursi: 2943, status_kursi: "TERJUAL" },
    ],
  },
};

console.log("=== Testing Seat Status Logic ===\n");

// Simulate the transformer (simplified)
function transformScheduleFromBackend(backendJadwal) {
  return {
    id: backendJadwal.id_jadwal,
    date: backendJadwal.tanggal,
    startTime: backendJadwal.jam_mulai,
    endTime: backendJadwal.jam_selesai,
    price: backendJadwal.harga_tiket,
    studio: {
      id: backendJadwal.studio.id_studio,
      number: backendJadwal.studio.no_studio,
      cabang: backendJadwal.studio.cabang,
      tipeStudio: backendJadwal.studio.tipeStudio,
      kursis: backendJadwal.studio.kursis,
    },
    film: {
      id_film: backendJadwal.film.id_film,
      title: backendJadwal.film.nama_film,
      poster: backendJadwal.film.poster_url,
      duration: backendJadwal.film.durasi,
    },
    statusKursis: backendJadwal.statusKursis || [],
  };
}

// Simulate the API response
const apiResponse = backendResponse;
console.log("1. API Response received");
console.log("   statusKursis count:", apiResponse.data.statusKursis.length);

// Simulate the service transformation
const transformedData = transformScheduleFromBackend(apiResponse.data);
console.log("\n2. After transformation");
console.log("   statusKursis count:", transformedData.statusKursis.length);
console.log("   statusKursis preserved:", transformedData.statusKursis.length > 0 ? "✅" : "❌");

// Simulate the seat mapping logic
console.log("\n3. Mapping seats:");
const mappedSeats = transformedData.studio.kursis.map((kursi) => {
  const seatStatus = transformedData.statusKursis?.find((s) => s.id_kursi === kursi.id_kursi);

  let status = 0; // Default: available

  if (seatStatus) {
    status = seatStatus.status_kursi === "TERSEDIA" ? 0 : 1;
  }

  console.log(`   Kursi ${kursi.id_kursi} (${kursi.row_kursi}${kursi.no_kursi}):`);
  console.log(`     - Found statusKursi: ${seatStatus ? "✅" : "❌"}`);
  console.log(`     - status_kursi value: "${seatStatus?.status_kursi}"`);
  console.log(`     - Comparison result: ${seatStatus?.status_kursi === "TERSEDIA"}`);
  console.log(`     - Final status: ${status} (${status === 0 ? "AVAILABLE" : "OCCUPIED"})`);

  return {
    seat_id: kursi.id_kursi,
    row: kursi.row_kursi,
    number: kursi.no_kursi,
    status: status,
  };
});

console.log("\n4. Final Result:");
console.log("   Total seats:", mappedSeats.length);
console.log("   Available seats:", mappedSeats.filter((s) => s.status === 0).length);
console.log("   Occupied seats:", mappedSeats.filter((s) => s.status === 1).length);

console.log("\n5. Expected vs Actual:");
console.log("   Expected available: 2 (kursi 2941, 2942)");
console.log("   Expected occupied: 1 (kursi 2943)");
console.log("   Actual available:", mappedSeats.filter((s) => s.status === 0).length);
console.log("   Actual occupied:", mappedSeats.filter((s) => s.status === 1).length);

const testPassed = mappedSeats.filter((s) => s.status === 0).length === 2 && mappedSeats.filter((s) => s.status === 1).length === 1;

console.log("\n" + (testPassed ? "✅ TEST PASSED" : "❌ TEST FAILED"));
