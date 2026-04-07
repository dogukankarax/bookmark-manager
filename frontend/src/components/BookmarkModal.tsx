import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBookmarkSchema, type CreateBookmarkForm } from "@/lib/schemas";
import { createBookmark, updateBookmark, type Bookmark } from "@/lib/api";

interface BookmarkModalProps {
  show: boolean;
  onClose: () => void;
  onBookmarkAdded: () => void;
  bookmark?: Bookmark;
}

export default function BookmarkModal({
  show,
  onClose,
  onBookmarkAdded,
  bookmark,
}: Readonly<BookmarkModalProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBookmarkForm>({
    resolver: zodResolver(createBookmarkSchema),
  });

  useEffect(() => {
    if (bookmark) {
      reset({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || "",
        tags: bookmark.tags?.join(", ") || "",
      });
    } else {
      reset({ title: "", url: "", description: "", tags: "" });
    }
  }, [bookmark, reset]);

  const onSubmit = async (data: CreateBookmarkForm) => {
    try {
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      if (bookmark) {
        await updateBookmark(String(bookmark.id), {
          title: data.title,
          url: data.url,
          description: data.description,
          tags: tagsArray,
        });
      } else {
        await createBookmark(data.title, data.url, data.description, tagsArray);
      }

      reset();
      onClose();
      onBookmarkAdded();
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-overlay"
        onClick={() => onClose()}
        aria-hidden="true"
      />
      <div className="relative max-w-md w-full rounded-2xl p-8 glass-card mx-4 modal-content">
        <h2 className="text-xl font-semibold text-white mb-6">
          {bookmark ? "Edit Bookmark" : "Add Bookmark"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              placeholder="My awesome bookmark"
              type="text"
              id="title"
              {...register("title")}
              aria-invalid={errors.title ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.title?.message || "\u00A0"}
            </p>
          </div>
          <div>
            <label htmlFor="url" className="text-sm font-medium text-gray-300">
              Url
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              placeholder="https://example.com"
              type="text"
              id="url"
              {...register("url")}
              aria-invalid={errors.url ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.url?.message || "\u00A0"}
            </p>
          </div>
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              placeholder="A short description..."
              type="text"
              id="description"
              {...register("description")}
              aria-invalid={errors.description ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.description?.message || "\u00A0"}
            </p>
          </div>
          <div>
            <label htmlFor="tags" className="text-sm font-medium text-gray-300">
              Tags
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              placeholder="react, tutorial, frontend"
              type="text"
              id="tags"
              {...register("tags")}
              aria-invalid={errors.tags ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.tags?.message || "\u00A0"}
            </p>
          </div>
          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-xl glass-button"
          >
            {bookmark ? "Update" : "Add Bookmark"}
          </button>
        </form>
      </div>
    </div>
  );
}
