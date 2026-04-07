import { Trash2, Edit } from "lucide-react";
import type { Bookmark } from "@/lib/api";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: number) => void;
  onEdit: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({
  bookmark,
  onDelete,
  onEdit,
}: Readonly<BookmarkCardProps>) {
  const handleDeleteClick = () => {
    if (globalThis.confirm("Are you sure you want to delete this bookmark?")) {
      onDelete(bookmark.id);
    }
  };
  return (
    <div className="rounded-2xl p-6 glass-card flex flex-col h-full min-h-56">
      <h3 className="text-lg font-semibold text-white truncate">
        {bookmark.title}
      </h3>
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 hover:underline truncate block mt-1"
      >
        {bookmark.url}
      </a>
      <div className="flex-1">
        {bookmark.description && (
          <p className="text-sm text-gray-400 mt-3">{bookmark.description}</p>
        )}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {bookmark.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          onClick={handleDeleteClick}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500/10 rounded-lg px-2 py-1 transition-colors"
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
        <button
          onClick={() => onEdit(bookmark)}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-500/10 rounded-lg px-2 py-1 transition-colors"
        >
          <Edit size={18} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}
