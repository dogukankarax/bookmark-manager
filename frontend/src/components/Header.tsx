import { LogOut } from "lucide-react";

interface HeaderProps {
  readonly onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="max-w-6xl mx-auto w-full flex items-center justify-between mb-8">
      <h1 className="text-2xl font-semibold text-white">🔖 Bookmark Manager</h1>
      <button
        onClick={onLogout}
        className="py-2 px-4 rounded-xl glass-button flex items-center"
      >
        <LogOut size={20} />
        <span className="ml-2">Logout</span>
      </button>
    </header>
  );
}
