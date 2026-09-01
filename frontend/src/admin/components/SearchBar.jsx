import { FaSearch } from "react-icons/fa";
import "../Style/SearchBar.css";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="admin-searchbar">
      <FaSearch />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
