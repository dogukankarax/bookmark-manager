import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getBookmarks, removeToken, deleteBookmark, getToken } from "@/lib/api";
import type { Bookmark } from "@/lib/api";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import BookmarkCard from "@/components/BookmarkCard";
import BookmarkModal from "@/components/BookmarkModal";
import Pagination from "@/components/Pagination";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const token = getToken();
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [editBookmark, setEditBookmark] = useState<Bookmark | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate({ to: "/login" });
  };

  const fetchBookmarks = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const data = await getBookmarks(page, 9, search || undefined);
        if (data.error) {
          removeToken();
          navigate({ to: "/login" });
          return;
        }
        setBookmarks(data.bookmarks || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, page, navigate],
  );

  useEffect(() => {
    fetchBookmarks(false);
  }, [fetchBookmarks]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: number) => {
    try {
      await deleteBookmark(String(id));
      const data = await getBookmarks(page, 9, search || undefined);
      if (data.bookmarks?.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        setBookmarks(data.bookmarks || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto w-full flex-1">
        <div className="flex items-center gap-4 mb-8">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="py-3 px-6 rounded-xl glass-button whitespace-nowrap flex items-center"
            onClick={() => {
              setEditBookmark(undefined);
              setShowModal(true);
            }}
          >
            <Plus size={20} />
            <span className="ml-2">Add New</span>
          </button>
        </div>

        {/* Bookmark grid */}
        {bookmarks.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">No bookmarks yet</p>
            <p className="text-sm mt-2">Click "+ Add New" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {bookmarks.map((bookmark: Bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={handleDelete}
                onEdit={(b) => {
                  setEditBookmark(b);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        )}
      </main>
      {totalPages > 1 && (
        <div className="pb-4 pt-8">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
      <BookmarkModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditBookmark(undefined);
        }}
        onBookmarkAdded={() => fetchBookmarks(false)}
        bookmark={editBookmark}
      />
    </div>
  );
}
