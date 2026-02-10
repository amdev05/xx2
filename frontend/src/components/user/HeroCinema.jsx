import starOutlineIcon from "../../assets/icons/starOutlineIcon.svg";

import Button from "../ui/Button";

export default function HeroCinema({ data }) {
  return (
    <div className="relative w-full h-full rounded-b-myrad overflow-hidden">
      <img src={data.image} alt="poster" className="w-full h-full object-cover object-center" />

      <div className="absolute top-0 left-0 right-0 bottom-0 bg-linear-to-t from-black via-black/80 via-20% to-black/0 md:from-black/80 md:via-black/70"></div>

      <div className="absolute bottom-15 left-0 w-full flex flex-col items-center md:items-start md:left-10 mask-x-to-yellow-100 md:w-fit">
        <h1 className="">{data.name}</h1>

        <div className="text-xs md:text-sm font-medium space-x-2 text-tx-light mt-1 flex">
          {data.studio_type.map((st, index) => (
            <p className="space-x-2" key={index}>
              <span>{st}</span>
              {index < data.studio_type.length - 1 && <span>·</span>}
            </p>
          ))}
        </div>

        <p className="text-center text-[11px] text-tx-light/75 mt-2.5 max-w-75 md:text-left md:text-xs md:max-w-90">{data.address}</p>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <a href="#schedule" className="mx-auto md:mx-0">
            <Button classname={" w-65 md:w-fit"}>Beli Tiket Sekarang</Button>
          </a>

          <div className="w-65 md:w-fit flex gap-3">
            <Button variant="dark" classname={"flex-1 md:w-fit"}>
              Info
            </Button>
            <button className="bg-dark px-4.5 rounded-full cursor-pointer">
              <img src={starOutlineIcon} alt="" className="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
