import searchIcon from "../../assets/icons/searchIcon.svg";
import filterIcon from "../../assets/icons/filterIcon.svg";

export default function Search({ classname, ...props }) {
  return (
    <div className={`grid grid-cols-3 gap-2 md:gap-3 ${classname}`} {...props}>
      <div className="col-span-2 flex items-center text-sm border border-light rounded-myrad px-3.5 gap-3.5">
        <img src={searchIcon} alt="" className="w-4" />
        <input type="text" className="focus:outline-none py-2 text-tx-light/75 w-full" placeholder="Search" />
      </div>

      <div className="flex items-center text-xs border border-light rounded-myrad px-3.5 gap-3">
        <img src={filterIcon} alt="" className="w-4" />
        <select name="" id="" className="w-full focus:outline-none cursor-pointer">
          <option value="0">Filter</option>
          <option value="regular">Regular</option>
          <option value="premiere">Premiere</option>
          <option value="max">Max</option>
        </select>
      </div>
    </div>
  );
}
