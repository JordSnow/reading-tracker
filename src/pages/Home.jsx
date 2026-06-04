import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooksByStatus } from "../db/db";

const TILE_COLOURS = [
  "rgba(232,104,42,0.6)",
  "rgba(99,102,241,0.6)",
  "rgba(20,184,166,0.6)",
  "rgba(236,72,153,0.6)",
  "rgba(234,179,8,0.6)",
  "rgba(34,197,94,0.6)",
];

function Home() {
  const [currentBook, setCurrentBook] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [yearStats, setYearStats] = useState({ books: 0, pages: 0 });
  const [shelfCount, setShelfCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const table = await getBooksByStatus("Table");
      setCurrentBook(table[0] || null);
      const library = await getBooksByStatus("Library");
      const shelf = await getBooksByStatus("Shelf");
      setShelfCount(shelf.length);
      const sorted = [...library].sort(
        (a, b) => new Date(b.completed_date) - new Date(a.completed_date),
      );
      setRecentBooks(sorted.slice(0, 4));
      const currentYear = new Date().getFullYear();
      const yearBooks = library.filter((b) => {
        if (!b.completed_date) return false;
        return new Date(b.completed_date).getFullYear() === currentYear;
      });
      const totalPages = yearBooks.reduce(
        (sum, b) => sum + (b.page_count || 0),
        0,
      );
      setYearStats({ books: yearBooks.length, pages: totalPages });
    }
    load();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function progressPercent(book) {
    if (!book?.page_count || !book?.current_page) return 0;
    return Math.min(
      100,
      Math.round((book.current_page / book.page_count) * 100),
    );
  }

  const pct = progressPercent(currentBook);

  return (
    <div className="space-y-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <h1
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "28px",
            letterSpacing: "2px",
            color: "#f0efee",
          }}
        >
          munin
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Currently Reading */}
      {currentBook ? (
        <div
          className="glass rounded-2xl overflow-hidden"
          onClick={() => navigate("/table")}
          style={{ cursor: "pointer" }}
        >
          {/* Cover hero */}
          <div
            style={{
              position: "relative",
              height: "160px",
              overflow: "hidden",
            }}
          >
            {currentBook.cover_i ? (
              <>
                <img
                  src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-L.jpg`}
                  alt="cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.5)",
                  }}
                />
                <img
                  src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-M.jpg`}
                  alt="cover"
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "120px",
                    width: "auto",
                    borderRadius: "6px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    TILE_COLOURS[
                      currentBook.title.charCodeAt(0) % TILE_COLOURS.length
                    ],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "48px" }}>📖</span>
              </div>
            )}
            {/* Currently reading label */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(232,104,42,0.9)",
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              <span
                style={{ color: "#fff", fontSize: "11px", fontWeight: 500 }}
              >
                Reading
              </span>
            </div>
            {/* Title overlay */}
            {currentBook.cover_i && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "12px 16px 0 148px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {currentBook.title}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "12px",
                    marginTop: "2px",
                  }}
                >
                  {currentBook.author}
                </p>
              </div>
            )}
          </div>

          {/* Progress + meta */}
          <div style={{ padding: "14px 16px" }}>
            {!currentBook.cover_i && (
              <>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  {currentBook.title}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  {currentBook.author}
                </p>
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Started {formatDate(currentBook.started_date)}
              </span>
              {currentBook.page_count > 0 && (
                <span
                  style={{
                    color: "#E8682A",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {pct}%
                </span>
              )}
            </div>
            {currentBook.page_count > 0 && (
              <div
                style={{
                  height: "3px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "#E8682A",
                    borderRadius: "999px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>📚</p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            Nothing on the table right now
          </p>
          <button
            onClick={() => navigate("/shelf")}
            style={{
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
            Pick from Shelf
          </button>
        </div>
      )}

      {/* Year stats + shelf count */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <div className="glass rounded-2xl p-4" style={{ textAlign: "center" }}>
          <p style={{ color: "#f0efee", fontSize: "28px", fontWeight: 700 }}>
            {yearStats.books}
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            read {new Date().getFullYear()}
          </p>
        </div>
        <div className="glass rounded-2xl p-4" style={{ textAlign: "center" }}>
          <p style={{ color: "#f0efee", fontSize: "28px", fontWeight: 700 }}>
            {yearStats.pages > 999
              ? `${(yearStats.pages / 1000).toFixed(1)}k`
              : yearStats.pages}
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            pages {new Date().getFullYear()}
          </p>
        </div>
        <div
          className="glass rounded-2xl p-4"
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/shelf")}
        >
          <p style={{ color: "#f0efee", fontSize: "28px", fontWeight: 700 }}>
            {shelfCount}
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            on shelf
          </p>
        </div>
      </div>

      {/* Recent reads */}
      {recentBooks.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Recently Read
            </p>
            <button
              onClick={() => navigate("/library")}
              style={{
                color: "#E8682A",
                fontSize: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              See all
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {recentBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                style={{ flexShrink: 0, width: "72px", cursor: "pointer" }}
              >
                {book.cover_i ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                    alt="cover"
                    style={{
                      width: "72px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "72px",
                      height: "100px",
                      borderRadius: "6px",
                      background:
                        TILE_COLOURS[
                          book.title.charCodeAt(0) % TILE_COLOURS.length
                        ],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    📖
                  </div>
                )}
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "10px",
                    marginTop: "4px",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {book.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roll CTA */}
      <button
        onClick={() => navigate("/roll")}
        className="glass"
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid rgba(232,104,42,0.3)",
          color: "rgba(255,255,255,0.7)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          background: "rgba(232,104,42,0.08)",
        }}
      >
        🎲 Roll Next Book
      </button>
    </div>
  );
}

export default Home;
