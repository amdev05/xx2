import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import pricingService from "../../services/pricingService";
import cinemaService from "../../services/cinemaService";
import studioTypeService from "../../services/studioTypeService";

export default function AdminPricingPolicy() {
  const [filterCinema, setFilterCinema] = useState("all");
  const [filterStudioType, setFilterStudioType] = useState("all");
  const [filterDayType, setFilterDayType] = useState("all");
  const [pricingPolicies, setPricingPolicies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [studioTypes, setStudioTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [pricingRes, cinemasRes, studioTypesRes] = await Promise.all([pricingService.getAll(), cinemaService.getAll(), studioTypeService.getAll()]);

      if (pricingRes.success) {
        setPricingPolicies(pricingRes.data || []);
      }
      if (cinemasRes.success) {
        setCinemas(cinemasRes.data || []);
      }
      if (studioTypesRes.success) {
        setStudioTypes(studioTypesRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pricing policy?")) {
      return;
    }

    try {
      const response = await pricingService.delete(id);
      if (response.success) {
        setPricingPolicies(pricingPolicies.filter((p) => p.id_aturan_harga !== id));
        alert("Pricing policy deleted successfully");
      } else {
        alert(response.message || "Failed to delete pricing policy");
      }
    } catch (err) {
      console.error("Error deleting pricing policy:", err);
      alert(err.message || "Failed to delete pricing policy");
    }
  };

  const filteredPolicies = pricingPolicies.filter((policy) => {
    const matchesCinema = filterCinema === "all" || policy.id_cabang === parseInt(filterCinema);
    const matchesStudioType = filterStudioType === "all" || policy.id_tipe_studio === parseInt(filterStudioType);
    const matchesDayType = filterDayType === "all" || policy.id_tipe_hari === parseInt(filterDayType);
    return matchesCinema && matchesStudioType && matchesDayType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading pricing policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">⚠️ {error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
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
          <h1 className="text-gray-950 text-2xl font-bold">Pricing Policy Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage ticket pricing based on cinema, studio type, and day type</p>
        </div>
        <Link to="/admin/pricing-policy/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Add Pricing Policy
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterCinema}
            onChange={(e) => setFilterCinema(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Cinemas</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>

          <select
            value={filterStudioType}
            onChange={(e) => setFilterStudioType(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Studio Types</option>
            {studioTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            value={filterDayType}
            onChange={(e) => setFilterDayType(e.target.value)}
            className="px-4 py-2 text-gray-950 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Day Types</option>
            <option value="1">Weekday</option>
            <option value="2">Weekend</option>
          </select>
        </div>
      </div>

      {/* Pricing Policies Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cinema</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Studio Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Day Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr key={policy.id_aturan_harga} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">{policy.cabang?.nama_cabang || "N/A"}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{policy.tipeStudio?.tipe_studio || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${
                        policy.tipeHari?.tipe_hari === "WEEKDAY" ? "bg-blue-500/20 text-blue-500" : "bg-purple-500/20 text-purple-500"
                      }`}
                    >
                      {policy.tipeHari?.tipe_hari || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-primary">Rp {Number(policy.harga).toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4 text-gray-950">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/pricing-policy/${policy.id_aturan_harga}/edit`)}
                        className="px-3 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(policy.id_aturan_harga)} className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p>No pricing policies found</p>
          </div>
        )}
      </div>
    </div>
  );
}
