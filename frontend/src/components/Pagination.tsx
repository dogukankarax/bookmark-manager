import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (newPage: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-xl glass-button disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-gray-400 px-4">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 rounded-xl glass-button disabled:opacity-30"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
