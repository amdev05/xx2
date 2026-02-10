import searchIcon from "../../assets/icons/searchIcon.svg";
import filterIcon from "../../assets/icons/filterIcon.svg";

export const Search = ({ className, searchValue, onSearchValue, ...props }) => {
  return (
    <div className={`flex items-center text-sm border border-light rounded-myrad px-3.5 gap-3.5 ${className}`} {...props}>
      <img src={searchIcon} alt="search icon" className="w-4" />
      <input type="text" className="focus:outline-none py-2 text-tx-light/75 w-full" placeholder="Search" value={searchValue} onChange={(e) => onSearchValue(e.target.value)} />
    </div>
  );
};

export const Filter = ({ className, filterValue, onFilterValue, ...props }) => {
  return (
    <div className={`flex items-center text-xs border border-light rounded-myrad px-3.5 gap-3 ${className}`} {...props}>
      <img src={filterIcon} alt="filter icon" className="w-4" />
      <select name="" id="" className="w-full focus:outline-none cursor-pointer" value={filterValue} onChange={(e) => onFilterValue(e.target.value)}>
        <option value="">Filter</option>
        <option value="regular">Regular</option>
        <option value="premiere">Premiere</option>
        <option value="max">Max</option>
      </select>
    </div>
  );
};

export const SearchFilter = ({ classname, searchValue, onSearchValue, filterValue, onFilterValue, ...props }) => {
  return (
    <div className={`grid grid-cols-3  gap-2 md:gap-3 ${classname}`} {...props}>
      <Search searchValue={searchValue} onSearchValue={onSearchValue} className={"col-span-2"} />

      <Filter filterValue={filterValue} onFilterValue={onFilterValue} />
    </div>
  );
};
