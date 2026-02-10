import { CastCard } from "../../ui/Card";

export default function MovieDetail({ data }) {
  // Filter out null/undefined items from arrays
  const castList = (data.cast || []).filter(Boolean);
  const crewList = (data.crew || []).filter(Boolean);
  
  return (
    <section className="my-container space-y-4">
      <div className="py-4">
        <h2 className="font-semibold">Sinopsis</h2>
        <p className="text-sm mt-1">{data.synopsis || "No synopsis available"}</p>
      </div>

      {castList.length > 0 && (
        <div className="overflow-hidden border-t border-light/25 py-4">
          <h2 className="font-semibold">Pemeran</h2>
          <div className="flex overflow-x-auto gap-x-2 mt-2.5 hidden-scrollbar">
            {castList.map((c, index) => (
              <CastCard data={c} key={index} />
            ))}
          </div>
        </div>
      )}

      {crewList.length > 0 && (
        <div className="overflow-hidden border-t border-light/25 py-4">
          <h2 className="font-semibold">Kru</h2>
          <div className="flex overflow-x-auto gap-x-2 mt-2.5 hidden-scrollbar">
            {crewList.map((c, index) => (
              <CastCard data={c} key={index} />
            ))}
          </div>
        </div>
      )}

      {data.production && (
        <div className="overflow-hidden border-t border-light/25 py-4">
          <h2 className="font-semibold">Produksi</h2>
          <div className="flex overflow-x-auto gap-x-2 mt-2.5 hidden-scrollbar">
            <CastCard data={data.production} />
          </div>
        </div>
      )}
    </section>
  );
}
