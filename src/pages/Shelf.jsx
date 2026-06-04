import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBooksByStatus,
  addBook,
  deleteBook,
  startBook,
  getTableCount,
  getAllBookTitles,
  getCoverUrl,
} from "../db/db";
import { createPortal } from "react-dom";
import ConfirmModal from "../components/ConfirmModal";
import SortControl from "../components/SortControl";
import Fuse from "fuse.js";

const TILE_COLOURS = [
  "rgba(232,104,42,0.6)",
  "rgba(99,102,241,0.6)",
  "rgba(20,184,166,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(234,179,8,0.6)",
  "rgba(34,197,94,0.6)",
];

const GOOGLE_BOOKS_KEY = "AIzaSyCrziNe4pfeBNbbnYGox9zn9d3jJgOy-E0";

function CoverTile({ title, size = "md" }) {
  const idx = title.charCodeAt(0) % TILE_COLOURS.length;
  const sizes = {
    sm: "w-8 h-11 text-xs",
    md: "w-12 h-16 text-sm",
    lg: "w-20 h-28 text-xl",
  };
  return (
    <div
      className={`${sizes[size]} rounded-lg flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: TILE_COLOURS[idx] }}
    >
      {title.charAt(0).toUpperCase()}
    </div>
  );
}
function today() {
  return new Date().toISOString().split("T")[0];
}

function cleanGenre(subjects) {
  if (!subjects || subjects.length === 0) return null;
  const clean = subjects.find(
    (s) => !s.includes(":") && !s.includes("=") && s.length < 30,
  );
  return clean || null;
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Shelf() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [startModal, setStartModal] = useState(null);
  const [startDate, setStartDate] = useState(today());
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [existingTitles, setExistingTitles] = useState([]);
  const navigate = useNavigate();
  const [totalResults, setTotalResults] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [sortBy, setSortBy] = useState("added");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterGenre, setFilterGenre] = useState(null);
  const [showGenres, setShowGenres] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 600);

  useEffect(() => {
    if (debouncedSearch.trim().length > 2) {
      handleSearch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    async function loadBooks() {
      const rows = await getBooksByStatus("Shelf");
      setBooks(rows);
    }
    loadBooks();
  }, []);

  async function handleSearch(page) {
    const p = Number.isFinite(page) ? page : 1;
    if (!searchQuery.trim()) return;
    setSearching(true);
    if (p === 1) {
      setSelectedBooks([]);
      setSearchResults([]);
      setTotalResults(0); // ← change this to 0 not null
    }
    const titles = await getAllBookTitles();
    setExistingTitles(titles);
    try {
      const offset = (p - 1) * 10;
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&startIndex=${offset}&maxResults=10&key=${GOOGLE_BOOKS_KEY}`,
      );
      const data = await res.json();
      const books = (data.items || []).map((b) => ({
        key: `gb_${b.id}`,
        title: b.volumeInfo?.title,
        author_name: b.volumeInfo?.authors,
        number_of_pages_median: b.volumeInfo?.pageCount,
        subject: b.volumeInfo?.categories,
        cover_url: b.volumeInfo?.imageLinks?.thumbnail?.replace(
          "http://",
          "https://",
        ),
        first_publish_year: b.volumeInfo?.publishedDate?.split("-")[0],
      }));
      setTotalResults(data.totalItems ?? 0);
      if (p === 1) {
        setSearchResults(books);
      } else {
        setSearchResults((prev) => [...prev, ...books]);
      }
    } catch {
      alert("Search failed. Please try again.");
    }
    setSearching(false);
  }
  function toggleSelect(result) {
    setSelectedBooks((prev) => {
      const exists = prev.find((b) => b.key === result.key);
      if (exists) return prev.filter((b) => b.key !== result.key);
      return [...prev, result];
    });
  }

  function isSelected(result) {
    return selectedBooks.some((b) => b.key === result.key);
  }

  async function handleAddSelected() {
    for (const result of selectedBooks) {
      await addBook({
        title: result.title || "Unknown Title",
        author: result.author_name?.[0] || "Unknown Author",
        page_count: result.number_of_pages_median || null,
        genre: cleanGenre(result.subject),
        cover_url: result.cover_url || null,
        cover_i: null,
        release_year: result.first_publish_year || null,
        roll_eligible: true,
        is_unreleased: false,
        is_standalone: true,
      });
    }
    setShowModal(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedBooks([]);
    const rows = await getBooksByStatus("Shelf");
    setBooks(rows);
  }

  function handleDelete(id) {
    setConfirmModal({
      message: "Remove this book from your shelf?",
      onConfirm: async () => {
        await deleteBook(id);
        setConfirmModal(null);
        const rows = await getBooksByStatus("Shelf");
        setBooks(rows);
      },
    });
  }

  async function handleStartReading(book) {
    const tableCount = await getTableCount();
    if (tableCount >= 1) {
      alert(
        "You already have a book on The Table! Finish it before starting a new one.",
      );
      return;
    }
    setStartModal(book);
    setStartDate(today());
  }

  async function confirmStart() {
    await startBook(startModal.id, startDate);
    setStartModal(null);
    navigate("/table");
  }

  const availableGenres = [
    ...new Set(
      books
        .map((b) => b.genre)
        .filter(
          (g) => g && !g.includes(":") && !g.includes("=") && g.length < 30,
        ),
    ),
  ].sort();

  const filteredBooks = (
    filterQuery.trim()
      ? new Fuse(books, {
          keys: [
            { name: "title", weight: 3 },
            { name: "author", weight: 2 },
            { name: "series_name", weight: 1.5 },
            { name: "genre", weight: 1 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
          minMatchCharLength: 2,
        })
          .search(filterQuery.trim())
          .map((result) => result.item)
      : books
  )
    .filter((b) => !filterGenre || b.genre === filterGenre)
    .sort((a, b) => {
      let result;
      if (sortBy === "title") result = a.title.localeCompare(b.title);
      else if (sortBy === "pages")
        result = (a.page_count || 0) - (b.page_count || 0);
      else if (sortBy === "genre")
        result = (a.genre || "").localeCompare(b.genre || "");
      else
        result =
          new Date(a.added_to_shelf_date || 0) -
            new Date(b.added_to_shelf_date || 0) || a.id - b.id;
      return sortDirection === "asc" ? result : -result;
    });

  return (
    <div className="space-y-4 relative">
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
          The Shelf
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
          {availableGenres.length > 0 ? (
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
          ) : null}
          <SortControl
            value={sortBy}
            onChange={setSortBy}
            direction={sortDirection}
            onDirectionChange={setSortDirection}
            options={[
              { value: "added", label: "Date added" },
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
          placeholder="Search your shelf..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#E8682A" }}
        >
          + Add Book
        </button>
        <button
          onClick={() => navigate("/roll")}
          className="flex-1 glass py-2.5 rounded-xl text-sm font-semibold text-white/80"
        >
          🎲 Roll from Shelf
        </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center mt-16 space-y-3">
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Your shelf is empty
          </p>
          <p style={{ color: "var(--text-faint)", fontSize: "12px" }}>
            Search for a book above to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="glass rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Cover */}
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
                {book.current_page > 0 && book.page_count > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ background: "rgba(0,0,0,0.3)" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((book.current_page / book.page_count) * 100))}%`,
                        background: "#E8682A",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col" style={{ minHeight: "120px" }}>
                <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-white/40 text-xs">{book.author}</p>
                {book.genre &&
                  !book.genre.includes(":") &&
                  !book.genre.includes("=") && (
                    <p
                      className="text-xs mb-2 mt-0.5"
                      style={{ color: "#E8682A" }}
                    >
                      {book.genre}
                    </p>
                  )}
                <div className="mt-auto space-y-1 text-xs mb-3">
                  {book.page_count && (
                    <div className="flex justify-between">
                      <span className="text-white/30">Pages</span>
                      <span className="text-white/60">{book.page_count}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/30">Roll</span>
                    <span className="text-white/60">
                      {book.roll_eligible ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartReading(book)}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{
                    background: "rgba(232,104,42,0.3)",
                    border: "1px solid rgba(232,104,42,0.5)",
                  }}
                >
                  Start Reading
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="w-full sm:max-w-lg flex flex-col rounded-2xl overflow-hidden"
              style={{
                height: "88vh",
                maxHeight: "88vh",
                background: "rgba(26,24,22,0.98)",
                border: "1px solid rgba(255,255,255,0.07)",
                margin: "0 8px",
              }}
            >
              <div
                className="p-4 flex items-center justify-between shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h2 className="font-semibold text-white">Add Books</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSearchResults([]);
                    setSearchQuery("");
                    setSelectedBooks([]);
                  }}
                  className="text-white/40 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div
                className="p-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                    enterKeyHint="search"
                  />
                  <button
                    onClick={() => handleSearch(1)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0"
                    style={{ background: "#E8682A" }}
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {searchResults.length === 0 && !searching && (
                  <p className="text-white/30 text-sm text-center py-8">
                    Search for books to add to your shelf
                  </p>
                )}
                {searchResults.map((result, i) => {
                  const ownedEntry = existingTitles.find(
                    (b) => b.title === result.title?.toLowerCase(),
                  );
                  const alreadyOwned = !!ownedEntry;
                  return (
                    <div
                      key={result.key || i}
                      onClick={() => !alreadyOwned && toggleSelect(result)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        alreadyOwned
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      style={{
                        background: isSelected(result)
                          ? "rgba(232,104,42,0.15)"
                          : "rgba(255,255,255,0.04)",
                        border: isSelected(result)
                          ? "1px solid rgba(232,104,42,0.5)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {result.cover_url ? (
                        <img
                          src={result.cover_url}
                          alt="cover"
                          className="w-10 h-14 object-cover rounded"
                        />
                      ) : (
                        <CoverTile title={result.title || "?"} size="sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-white/40">
                          {result.author_name?.[0] || "Unknown Author"}
                        </p>
                        {result.number_of_pages_median && (
                          <p className="text-xs text-white/30">
                            {result.number_of_pages_median} pages
                          </p>
                        )}
                        {alreadyOwned && (
                          <p
                            className="text-xs font-medium mt-0.5"
                            style={{ color: "#E8682A" }}
                          >
                            Already in{" "}
                            {ownedEntry.status === "Shelf"
                              ? "your Shelf"
                              : ownedEntry.status === "Table"
                                ? "The Table"
                                : "your Library"}
                          </p>
                        )}
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{
                          background: isSelected(result)
                            ? "#E8682A"
                            : "transparent",
                          borderColor: isSelected(result)
                            ? "#E8682A"
                            : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {isSelected(result) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* No results */}
                {!searching &&
                  searchResults.length === 0 &&
                  searchQuery.trim().length > 0 &&
                  totalResults === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-4xl">🔍</p>
                      <p className="text-white/40 text-sm">
                        No results for "{searchQuery}"
                      </p>
                      <p className="text-white/20 text-xs">
                        Try being more specific — e.g. "Harry Potter" instead of
                        "Harry"
                      </p>
                    </div>
                  )}

                {/* Load more */}
                {searchResults.length > 0 &&
                  searchResults.length < totalResults && (
                    <button
                      onClick={() =>
                        handleSearch(searchResults.length / 10 + 1)
                      }
                      disabled={searching}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-white/60 glass mt-2"
                    >
                      {searching
                        ? "Loading..."
                        : `Load more (${totalResults - searchResults.length} remaining)`}
                    </button>
                  )}

                {/* Searching spinner */}
                {searching && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                  </div>
                )}
              </div>
              {selectedBooks.length > 0 && (
                <div
                  className="p-4 shrink-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <button
                    onClick={handleAddSelected}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#E8682A" }}
                  >
                    Add {selectedBooks.length} book
                    {selectedBooks.length !== 1 ? "s" : ""} to Shelf
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Start Reading Modal */}
      {startModal &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
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
                <h2 className="font-semibold text-white">Start Reading</h2>
                <button
                  onClick={() => setStartModal(null)}
                  className="text-white/40 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-white/60 text-sm">
                  Starting{" "}
                  <span className="text-white font-semibold">
                    {startModal.title}
                  </span>
                </p>
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                    Start date
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <button
                  onClick={confirmStart}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#E8682A" }}
                >
                  Start Reading
                </button>
              </div>
            </div>
          </div>,
          document.body,
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

export default Shelf;
