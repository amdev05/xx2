const groupByRow = (seats) => {
  return seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});
};

export const SeatsLayout = ({ seats, selected, onSelect }) => {
  const seatsMap = groupByRow(seats);
  const sortedRows = Object.keys(seatsMap).sort().reverse();

  return (
    <div className="space-y-1.5 pb-4">
      {sortedRows.map((row) => {
        const sortedSeats = [...seatsMap[row]].sort((a, b) => b.number - a.number);

        return (
          <div key={row} className="flex gap-x-1.5">
            {sortedSeats.map((seat) => {
              const isSelected = selected?.some((s) => s.seat_id === seat.seat_id);
              const status = seat.status == 0 ? (isSelected ? "bg-[#396eff] cursor-pointer" : "bg-[#273e7b] cursor-pointer") : "bg-light/50 opacity-50";
              return (
                <button className={`w-9 h-8 shrink-0 rounded text-xs font-semibold  ${status}`} key={seat.seat_id} onClick={() => onSelect(seat)} disabled={seat.status !== 0}>
                  {seat.row}
                  {seat.number}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
