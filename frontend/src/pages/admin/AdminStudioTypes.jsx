import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import studioTypeService from "../../services/studioTypeService";

export default function AdminStudioTypes() {
  const [studioTypes, setStudioTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudioTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studioTypeService.getAll();
      setStudioTypes(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch studio types");
      console.error("Error fetching studio types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudioTypes();
  }, [fetchStudioTypes]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this studio type? This will affect all studios using this type.")) {
      try {
        await studioTypeService.delete(id);
        await fetchStudioTypes(); // Refresh list
      } catch (err) {
        alert(`Failed to delete studio type: ${err.message}`);
        console.error("Error deleting studio type:", err);
      }
    }
  };

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
        <button onClick={fetchStudioTypes} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-950 text-2xl font-bold">Studio Types Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage different studio types and their features</p>
        </div>
        <Link to="/admin/studio-types/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
          + Add Studio Type
        </Link>
      </div>

      {/* Empty State */}
      {studioTypes.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600">No studio types found. Add your first studio type to get started!</p>
        </div>
      ) : (
        /* Studio Types Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studioTypes.map((type) => (
            <div key={type.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
              {type.image && (
                <div className="aspect-video overflow-hidden">
                  <img src={type.image} alt={type.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-gray-950 text-lg font-bold">{type.name}</h3>
                <p className="text-sm text-gray-700 mt-2">{type.description || "No description available"}</p>

                {type.features && type.features.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-700 flex items-center gap-2">
                          <span className="text-primary">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {type.basePrice && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-xl text-gray-950 font-bold text-primary">Rp {type.basePrice.toLocaleString("id-ID")}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link to={`/admin/studio-types/${type.id}/edit`} className="flex-1 px-3 py-2 text-sm bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors text-center">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(type.id)} className="flex-1 px-3 py-2 text-sm bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
