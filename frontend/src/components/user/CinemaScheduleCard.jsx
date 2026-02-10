import starFillIcon from "../../assets/icons/starFillIcon.svg";
import starOutlineIcon from "../../assets/icons/starOutlineIcon.svg";

export default function CinemaScheduleCard({ cinema, onTimeSelect }) {
  if (!cinema) return null;

  return (
    <div className="relative border-t border-light/25">
      <div className="rounded-myrad p-5 pb-12">
        <div className="space-y-5">
          <div className="flex">
            <p className="text-sm md:text-base font-semibold cursor-pointer">{cinema.name}</p>
          </div>

          {Object.entries(cinema.studioTypes).map(([studioType, schedules], index) => (
            <div className="" key={index}>
              <p className="text-xs md:text-sm text-tx-light/75 font-semibold">{studioType}</p>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {schedules.map((schedule, idx) => (
                  <button
                    className="border text-center py-3 rounded-myrad text-xs md:text-sm font-bold border-light/25 cursor-pointer hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    key={idx}
                    onClick={() => onTimeSelect(schedule.id)}
                    disabled={schedule.available === 0}
                  >
                    {schedule.time}
                    {schedule.available === 0 && <span className="block text-[10px] text-red-400 mt-1">Penuh</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <img src={starOutlineIcon} alt="" className="absolute top-6 right-5 cursor-pointer" />
    </div>
  );
}
