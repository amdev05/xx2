import { formatDuration } from "../../utils/formatDuration";
import { Link } from "react-router-dom";

export default function MovieCard({ data, index, ...props }) {
  // Check if movie is released or not
  const releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
  const today = new Date();
  const isReleased = releaseDate ? releaseDate <= today : true;

  // Format release date
  const formatReleaseDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link to={`/movie/${data.id}`} className="relative rounded-myrad inline-block overflow-hidden aspect-2/3" {...props}>
      <img src={data.image} alt="poster" className="w-full h-full object-cover" />

      {index && (
        <div className="absolute top-3 left-3.5 ">
          <span className="text-4xl font-semibold">{index + 1}</span>
        </div>
      )}
      <div className="absolute top-3.5 right-3.5 rounded-full bg-dark/50 px-2 border border-light/50 text-[10px] py-0.5">
        <span className="font-medium opacity-75">{isReleased ? "Tayang" : formatReleaseDate(releaseDate)}</span>
      </div>

      <div className="absolute bottom-0 left-0 w-full text-xs px-3.5 pb-2 pt-5 space-x-2 bg-linear-to-t from-black to-black/0 text-tx-light/75 font-medium">
        <span>{formatDuration(data.duration)}</span>
        <span>{data.age}</span>
        <span>{data.genre[0]}</span>
      </div>
    </Link>
  );
}
