import { useState } from "react";
import { createPortal } from "react-dom";
import { updateBook } from "../db/db";

function BookDetailModal({ book, onClose, onUpdate, extraActions }) {
  const [rollEligible, setRollEligible] = useState(book.roll_eligible);
  const [notes, setNotes] = useState(book.notes || "");
  const [genre, setGenre] = useState(
    book.genre?.includes(":") || book.genre?.includes("=")
      ? ""
      : book.genre || "",
  );
  const [rating, setRating] = useState(book.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [startedDate, setStartedDate] = useState(
    book.started_date
      ? new Date(book.started_date).toISOString().split("T")[0]
      : "",
  );
  const [completedDate, setCompletedDate] = useState(
    book.completed_date
      ? new Date(book.completed_date).toISOString().split("T")[0]
      : "",
  );
  const [saving, setSaving] = useState(false);

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function handleSave() {
    setSaving(true);
    await updateBook(book.id, {
      roll_eligible: rollEligible,
      notes,
      genre,
      is_unreleased: book.is_unreleased,
      is_standalone: book.is_standalone,
      rating,
      started_date: startedDate || null,
      completed_date: completedDate || null,
    });
    setSaving(false);
    onUpdate();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end sm:justify-center items-center z-50"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        padding: "0 8px",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        className="w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          maxHeight: "90vh",
          background: "rgba(26,24,22,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          margin: "0 8px",
          marginTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="font-semibold text-white">Book Details</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Cover + title */}
          <div className="flex gap-4 p-5">
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt="cover"
                className="w-20 h-28 object-cover rounded-xl shadow-lg shrink-0"
              />
            ) : (
              <div
                className="w-20 h-28 rounded-xl flex items-center justify-center text-center p-2 shrink-0"
                style={{ background: "rgba(232,104,42,0.3)" }}
              >
                <span className="text-white text-xs font-bold">
                  {book.title}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">
                {book.title}
              </h3>
              <p className="text-white/50 text-sm mt-1">{book.author}</p>
              {book.page_count && (
                <p className="text-white/30 text-xs mt-1">
                  {book.page_count} pages
                </p>
              )}
              {book.release_year && (
                <p className="text-white/30 text-xs mt-1">
                  Published {book.release_year}
                </p>
              )}
              {book.series_name && (
                <p className="text-white/30 text-xs mt-1">
                  Series: {book.series_name}
                </p>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div
            className="px-5 pb-4 space-y-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "1rem",
            }}
          >
            {/* Genre */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                Genre
              </label>
              <input
                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "16px",
                }}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Fantasy, Sci-Fi..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "16px",
                }}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this book..."
              />
            </div>

            {/* Started date — show for Table and Library */}
            {(book.status === "Table" || book.status === "Library") && (
              <div
                className={`grid gap-3 ${book.status === "Library" ? "grid-cols-2" : "grid-cols-1"}`}
              >
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                    Started
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl px-3 py-2 text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "16px",
                      maxWidth: "100%",
                    }}
                    value={startedDate}
                    onChange={(e) => setStartedDate(e.target.value)}
                  />
                </div>
                {book.status === "Library" && (
                  <div>
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                      Completed
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl px-3 py-2 text-white outline-none"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "16px",
                        maxWidth: "100%",
                      }}
                      value={completedDate}
                      onChange={(e) => setCompletedDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rating — show for Library only */}
            {book.status === "Library" && (
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                  Rating
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl transition-all"
                      style={{
                        color:
                          star <= (hoverRating || rating)
                            ? "#E8682A"
                            : "rgba(255,255,255,0.15)",
                        filter:
                          star <= (hoverRating || rating)
                            ? "drop-shadow(0 0 6px rgba(232,104,42,0.6))"
                            : "none",
                        transform:
                          star <= (hoverRating || rating)
                            ? "scale(1.2)"
                            : "scale(1)",
                        transition: "all 0.15s",
                        fontSize: "16px",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs mt-2" style={{ color: "#E8682A" }}>
                    {
                      [
                        "",
                        "Terrible",
                        "Not great",
                        "Decent",
                        "Really good",
                        "Incredible!",
                      ][rating]
                    }
                  </p>
                )}
              </div>
            )}

            {/* Roll eligible toggle — Shelf only */}
            {book.status === "Shelf" && (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">
                    Roll eligible
                  </p>
                  <p className="text-xs text-white/30">
                    Include in random roll
                  </p>
                </div>
                <button
                  onClick={() => setRollEligible(!rollEligible)}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{
                    background: rollEligible
                      ? "#E8682A"
                      : "rgba(255,255,255,0.15)",
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: rollEligible ? "1.75rem" : "0.25rem" }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Extra actions */}
          {extraActions && (
            <div
              className="px-5 pb-4 space-y-2"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "1rem",
              }}
            >
              {extraActions}
            </div>
          )}
        </div>

        {/* Save button */}
        <div
          className="p-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#E8682A" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default BookDetailModal;
