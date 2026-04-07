import { Search } from "lucide-react";

interface SearchBarProps {
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-1 relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
      />
      <input
        type="text"
        placeholder="Search bookmarks..."
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
      />
    </div>
  );
}
