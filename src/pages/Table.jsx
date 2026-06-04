import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBooksByStatus,
  updateProgress,
  finishBook,
  moveBookToShelf,
  getCoverUrl,
} from "../db/db";
import ConfirmModal from "../components/ConfirmModal";

const TILE_COLOURS = [
  "rgba(232,104,42,0.6)",
  "rgba(99,102,241,0.6)",
  "rgba(20,184,166,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(234,179,8,0.6)",
  "rgba(34,197,94,0.6)",
];

function today() {
  return new Date().toISOString().split("T")[0];
}

function Table() {
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState("");
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState(null);
  const [completedDate, setCompletedDate] = useState(today());

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  useEffect(() => {
    async function load() {
      const rows = await getBooksByStatus("Table");
      if (rows[0]) {
        setBook(rows[0]);
        setCurrentPage(rows[0].current_page || "");
      }
    }
    load();
  }, []);

  async function handleUpdateProgress() {
    if (!currentPage) return;
    await updateProgress(book.id, parseInt(currentPage));
    const rows = await getBooksByStatus("Table");
    if (rows[0]) {
      setBook(rows[0]);
      setCurrentPage(rows[0].current_page || "");
    }
  }

  async function handleFinish() {
    if (!completedDate) return;
    if (book.started_date && completedDate < book.started_date) {
      alert("Completed date cannot be before started date.");
      return;
    }
    await finishBook(book.id, completedDate, rating);
    setShowFinishModal(false);
    navigate("/");
  }

  function progressPercent() {
    if (!book?.page_count || !book?.current_page) return 0;
    return Math.min(
      100,
      Math.round((book.current_page / book.page_count) * 100),
    );
  }

  if (!book) {
    return (
      <div className="text-center mt-16 space-y-3">
        <p style={{ fontSize: "40px" }}>📖</p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Nothing on the table right now
        </p>
        <p style={{ color: "var(--text-faint)", fontSize: "12px" }}>
          Pick a book from your shelf to start reading
        </p>
        <button
          onClick={() => navigate("/shelf")}
          style={{
            marginTop: "8px",
            padding: "10px 24px",
            borderRadius: "12px",
            border: "none",
            background: "#E8682A",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Go to Shelf
        </button>
      </div>
    );
  }

  const tileColor =
    TILE_COLOURS[book.title.charCodeAt(0) % TILE_COLOURS.length];
  const pct = progressPercent();

  return (
    <div className="space-y-4">
      <h1
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 200,
          fontSize: "28px",
          letterSpacing: "2px",
          color: "#f0efee",
          marginBottom: "16px",
        }}
      >
        The Table
      </h1>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Cover banner */}
        <div className="relative h-48 overflow-hidden">
          {getCoverUrl(book, "L") ? (
            <>
              <img
                src={getCoverUrl(book, "L")}
                alt="cover"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))",
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl font-bold text-white"
              style={{ background: tileColor }}
            >
              <span className="text-white font-bold text-sm leading-tight line-clamp-4">
                {book.title}
              </span>
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <h2 className="font-bold text-white text-xl leading-tight">
              {book.title}
            </h2>
            <p className="text-white/60 text-sm">{book.author}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-white/30">Started</span>
            <span className="text-right text-white/70">
              {formatDate(book.started_date)}
            </span>
            {book.page_count && (
              <>
                <span className="text-white/30">Pages</span>
                <span className="text-right text-white/70">
                  {book.page_count}
                </span>
              </>
            )}
            {book.randomly_rolled && (
              <>
                <span className="text-white/30">How picked</span>
                <span className="text-right text-white/70">
                  🎲 Randomly rolled
                </span>
              </>
            )}
          </div>

          {/* Progress bar */}
          {book.page_count > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/30">Progress</span>
                <span className="font-semibold" style={{ color: "#E8682A" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="w-full rounded-full h-2"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${pct}%`, background: "#E8682A" }}
                />
              </div>
            </div>
          )}

          {/* Update progress */}
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="Current page..."
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
            />
            <button
              onClick={handleUpdateProgress}
              className="glass px-4 py-2 rounded-xl text-sm font-semibold text-white/80"
            >
              Update
            </button>
          </div>
          <button
            onClick={() => navigate(`/book/${book.id}`)}
            className="w-full glass py-2 rounded-xl text-sm font-medium text-white/60 mt-2"
          >
            Edit Details
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowFinishModal(true)}
        className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
        style={{ background: "#E8682A" }}
      >
        ✓ Mark as Finished
      </button>
      <button
        onClick={() =>
          setConfirmModal({
            message: `Move "${book.title}" back to your shelf? Your page progress will be saved.`,
            onConfirm: async () => {
              await moveBookToShelf(book.id);
              setConfirmModal(null);
              navigate("/shelf");
            },
          })
        }
        className="w-full glass py-3 rounded-2xl text-sm font-medium text-white/40 mt-2"
      >
        ↩ Put back on Shelf (page progress saved)
      </button>

      {/* Finish Modal */}
      {showFinishModal && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "rgba(26,24,22,0.98)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="p-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="font-semibold text-white">Finish Book</h2>
              <button
                onClick={() => setShowFinishModal(false)}
                className="text-white/40 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
                  Completed date
                </label>
                {book?.started_date && (
                  <p className="text-xs mb-2" style={{ color: "#E8682A" }}>
                    Must be on or after{" "}
                    {new Date(book.started_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
                <input
                  type="date"
                  min={book?.started_date || ""}
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
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Rating (optional)
                </label>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star === rating ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl transition-all active:scale-90"
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
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p
                    className="text-center text-xs mt-2"
                    style={{ color: "#E8682A" }}
                  >
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
              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#E8682A" }}
              >
                Save & Move to Library
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

export default Table;
