import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooksByStatus, deleteBook, getCoverUrl } from "../db/db";
import ConfirmModal from "../components/ConfirmModal";
import SortControl from "../components/SortControl";
import { TILE_COLOURS } from "../constants";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? "#E8682A" : "rgba(255,255,255,0.15)",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Library() {
  const [books, setBooks] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterYear, setFilterYear] = useState("all");
  const [filterGenre, setFilterGenre] = useState(null);
  const [showGenres, setShowGenres] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const rows = await getBooksByStatus("Library");
      setBooks(rows);
    }
    load();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  async function handleDelete(id) {
    setConfirmModal({
      message: "Remove this book from your library?",
      onConfirm: async () => {
        await deleteBook(id);
        setConfirmModal(null);
        const rows = await getBooksByStatus("Library");
        setBooks(rows);
      },
    });
  }

  const completedYears = [
    ...new Set(
      books
        .map((b) =>
          b.completed_date ? new Date(b.completed_date).getFullYear() : null,
        )
        .filter(Boolean),
    ),
  ].sort((a, b) => b - a);

  const availableGenres = [
    ...new Set(
      books
        .map((b) => b.genre)
        .filter(
          (g) => g && !g.includes(":") && !g.includes("=") && g.length < 30,
        ),
    ),
  ].sort();

  const filteredBooks = books
    .filter(
      (b) =>
        (b.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(filterQuery.toLowerCase())) &&
        (filterYear === "all" ||
          (b.completed_date &&
            new Date(b.completed_date).getFullYear() === Number(filterYear))) &&
        (!filterGenre || b.genre === filterGenre),
    )
    .sort((a, b) => {
      let result;
      if (sortBy === "title") result = a.title.localeCompare(b.title);
      else if (sortBy === "pages")
        result = (a.page_count || 0) - (b.page_count || 0);
      else if (sortBy === "genre")
        result = (a.genre || "").localeCompare(b.genre || "");
      else
        result =
          new Date(a.completed_date || 0) - new Date(b.completed_date || 0);
      return sortDirection === "asc" ? result : -result;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col mb-4">
        <h1
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "28px",
            letterSpacing: "2px",
            color: "#f0efee",
          }}
        >
          The Library · {books.length}
        </h1>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            width: "100%",
            marginTop: "8px",
          }}
        >
          {availableGenres.length > 0 && (
            <button
              onClick={() => setShowGenres(!showGenres)}
              style={{
                padding: "5px 10px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: filterGenre ? "#E8682A" : "rgba(255,255,255,0.08)",
                background: filterGenre
                  ? "rgba(232,104,42,0.15)"
                  : "rgba(255,255,255,0.04)",
                color: filterGenre ? "#E8682A" : "rgba(255,255,255,0.4)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              Genres
              {filterGenre && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#E8682A",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "1px 5px",
                  }}
                >
                  {filterGenre}
                </span>
              )}
              <span style={{ fontSize: "10px", opacity: 0.5 }}>
                {showGenres ? "↑" : "↓"}
              </span>
            </button>
          )}
          <SortControl
            value={sortBy}
            onChange={setSortBy}
            direction={sortDirection}
            onDirectionChange={setSortDirection}
            options={[
              { value: "added", label: "Completed" },
              { value: "title", label: "A–Z" },
              { value: "pages", label: "Page count" },
            ]}
          />
        </div>
      </div>

      {showGenres && availableGenres.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginTop: "-8px",
          }}
        >
          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() =>
                setFilterGenre(filterGenre === genre ? null : genre)
              }
              style={{
                padding: "5px 10px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor:
                  filterGenre === genre ? "#E8682A" : "rgba(255,255,255,0.08)",
                background:
                  filterGenre === genre
                    ? "rgba(232,104,42,0.15)"
                    : "rgba(255,255,255,0.04)",
                color:
                  filterGenre === genre ? "#E8682A" : "rgba(255,255,255,0.4)",
                fontSize: "12px",
                fontWeight: filterGenre === genre ? 500 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
      {completedYears.length > 0 && (
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="text-xs font-medium text-white/50 rounded-lg px-2 py-1.5 outline-none w-full"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "16px",
          }}
        >
          <option value="all" style={{ background: "#1a1a1a" }}>
            All years
          </option>
          {completedYears.map((y) => (
            <option key={y} value={y} style={{ background: "#1a1a1a" }}>
              {y}
            </option>
          ))}
        </select>
      )}

      <div className="relative">
        <span className="absolute left-3 top-2.5 text-white/30 text-sm">
          🔍
        </span>
        <input
          className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          placeholder="Search completed books..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center mt-16 space-y-3">
          <p style={{ fontSize: "40px" }}>{books.length === 0 ? "📖" : "🔍"}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {books.length === 0
              ? "No books in your library yet"
              : "No books match your search"}
          </p>
          {books.length === 0 && (
            <p style={{ color: "var(--text-faint)", fontSize: "12px" }}>
              Finished books will appear here
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 items-start">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="glass rounded-2xl overflow-hidden flex flex-col h-full"
            >
              <div
                className="relative w-full aspect-[2/3] cursor-pointer"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {getCoverUrl(book) ? (
                  <img
                    src={getCoverUrl(book)}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                    style={{
                      background:
                        TILE_COLOURS[
                          book.title.charCodeAt(0) % TILE_COLOURS.length
                        ],
                    }}
                  >
                    <span className="text-white font-bold text-sm leading-tight line-clamp-4">
                      {book.title}
                    </span>
                  </div>
                )}
                {book.rating && (
                  <div className="absolute bottom-2 left-2">
                    <StarRating rating={book.rating} />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(book.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  ×
                </button>
              </div>
              <div className="p-3 flex flex-col" style={{ minHeight: "120px" }}>
                <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-white/40 text-xs mb-2">{book.author}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/30">Completed</span>
                    <span className="text-white/60">
                      {formatDate(book.completed_date)}
                    </span>
                  </div>
                  {book.page_count && (
                    <div className="flex justify-between">
                      <span className="text-white/30">Pages</span>
                      <span className="text-white/60">{book.page_count}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/30">Rolled</span>
                    <span className="text-white/60">
                      {book.randomly_rolled ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

export default Library;
