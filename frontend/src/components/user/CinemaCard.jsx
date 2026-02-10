import { Link } from "react-router-dom";

import starOutlineIcon from "../../assets/icons/starOutlineIcon.svg";
import starFillIcon from "../../assets/icons/starFillIcon.svg";
import { useState } from "react";

export default function CinemaCard({ data, ...props }) {
  const [isFavorite, setIsFavorite] = useState(data.favorite | false);

  const handleFavorite = () => {
    setIsFavorite((fav) => !fav);
  };

  return (
    <div className="relative border-b border-light/25" {...props}>
      <Link to={`/cinema/${data.id}`} className="not-visited:w-full inline-block p-5 transition hover:bg-card-dark rounded-myrad">
        <p className="text-sm md:text-base font-bold">{data.name}</p>
        <p className="text-[10px] md:text-xs text-tx-light/75 mr-5">{data.address}</p>

        <div className="text-xs text-tx-light/75 font-medium flex gap-2 mt-4 md:mt-6">
          {data.studio_type.map((st, index) => (
            <p className="space-x-2" key={index}>
              <span>{st}</span>
              {index < data.studio_type.length - 1 && <span>|</span>}
            </p>
          ))}
        </div>
      </Link>

      <img src={isFavorite ? starFillIcon : starOutlineIcon} alt="favorite" className="w-3.5 absolute top-5 right-5 cursor-pointer" onClick={handleFavorite} />
    </div>
  );
}
