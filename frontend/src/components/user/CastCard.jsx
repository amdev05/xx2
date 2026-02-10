export default function CastCard({ data, ...props }) {
  return (
    <div className="w-24 md:w-28 shrink-0" {...props}>
      {data.image ? (
        <img src={data.image} className="size-22 md:size-25 mx-auto aspect-auto rounded-full object-cover" />
      ) : (
        <div className="size-22 mx-auto aspect-square rounded-full flex justify-center items-center bg-[#9FA5B1] text-4xl font-semibold">AM</div>
      )}
      <div className="text-center mt-2">
        <p className="text-xs">{data.name}</p>
        <p className="text-[11px] text-tx-light/75 mt-0.5">{data.role}</p>
      </div>
    </div>
  );
}
