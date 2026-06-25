import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooksByStatus, getCoverUrl } from "../db/db";
import { TILE_COLOURS } from "../constants";

const mono = "'DM Mono', monospace";

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

  function Stars({ rating }) {
    if (!rating) return null;
    return (
      <div
        style={{
          color: "var(--orange)",
          fontSize: "9px",
          letterSpacing: "1px",
        }}
      >
        {"★".repeat(rating)}
        <span style={{ color: "var(--text-faint)" }}>
          {"★".repeat(Math.max(0, 5 - rating))}
        </span>
      </div>
    );
  }

  const pct = progressPercent(currentBook);
  const ringCircumference = 2 * Math.PI * 19;
  const ringOffset = ringCircumference * (1 - pct / 100);

  const today = new Date();
  const dayName = today
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toUpperCase();
  const dayDate = today
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();

  return (
    <div className="space-y-3.5 pb-2">
      {/* Header */}
      <div className="flex items-baseline justify-between pt-2 pb-1">
        <h1
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "26px",
            letterSpacing: "0.32em",
            color: "var(--text-primary)",
          }}
        >
          munin
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            textAlign: "right",
            lineHeight: 1.5,
          }}
        >
          {dayName}
          <br />
          <span style={{ color: "var(--orange-soft, #f0905c)" }}>
            {dayDate}
          </span>
        </p>
      </div>

      {/* Currently reading hero */}
      {currentBook ? (
        <div
          className="rounded-2xl overflow-hidden"
          onClick={() => navigate("/table")}
          style={{ cursor: "pointer", border: "1px solid var(--border)" }}
        >
          <div
            style={{
              position: "relative",
              minHeight: "190px",
              display: "flex",
              alignItems: "flex-end",
              padding: "16px",
              background: getCoverUrl(currentBook, "L")
                ? `linear-gradient(180deg, rgba(20,18,16,0.05) 0%, rgba(13,12,11,0.96) 88%), url(${getCoverUrl(currentBook, "L")})`
                : `linear-gradient(180deg, rgba(20,18,16,0.1) 0%, rgba(13,12,11,0.96) 88%), linear-gradient(135deg, ${TILE_COLOURS[currentBook.title.charCodeAt(0) % TILE_COLOURS.length]}, #1a1715)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: mono,
                fontSize: "10.5px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--orange-soft, #f0905c)",
              }}
            >
              <span
                className="dot-pulse"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--orange)",
                  boxShadow: "0 0 0 4px var(--orange-glow)",
                  display: "inline-block",
                }}
              />
              Currently reading
            </div>

            {getCoverUrl(currentBook) && (
              <img
                src={getCoverUrl(currentBook)}
                alt="cover"
                style={{
                  width: "92px",
                  height: "138px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow:
                    "0 18px 36px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)",
                  flexShrink: 0,
                }}
              />
            )}

            <div
              style={{
                flex: 1,
                paddingLeft: "16px",
                paddingBottom: "4px",
                minWidth: 0,
              }}
            >
              <p
                style={{
                  fontSize: "19px",
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: 1.25,
                  marginBottom: "4px",
                }}
              >
                {currentBook.title}
              </p>
              <p
                style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)" }}
              >
                {currentBook.author}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "16px 18px 18px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <svg
                width="46"
                height="46"
                viewBox="0 0 46 46"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="23"
                  cy="23"
                  r="19"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="23"
                  cy="23"
                  r="19"
                  fill="none"
                  stroke="var(--orange)"
                  strokeWidth="4"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {pct}%
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: mono,
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <span>Started {formatDate(currentBook.started_date)}</span>
                {currentBook.page_count > 0 && (
                  <span style={{ color: "var(--text-secondary)" }}>
                    {currentBook.current_page || 0} / {currentBook.page_count}{" "}
                    pages
                  </span>
                )}
              </div>
              {currentBook.page_count > 0 && (
                <div
                  style={{
                    height: "2px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, var(--orange-soft, #f0905c), var(--orange))",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-6"
          style={{
            textAlign: "center",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
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
              background: "var(--orange)",
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

      {/* Stat strip */}
      <div
        className="rounded-2xl"
        style={{
          display: "flex",
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.025)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            textAlign: "center",
            borderRight: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: "22px",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {yearStats.books}
          </p>
          <p
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              marginTop: "5px",
              letterSpacing: "0.04em",
            }}
          >
            read {new Date().getFullYear()}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            textAlign: "center",
            borderRight: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: "22px",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {yearStats.pages > 999 ? (
              <>
                {(yearStats.pages / 1000).toFixed(1)}
                <span style={{ color: "var(--orange-soft, #f0905c)" }}>k</span>
              </>
            ) : (
              yearStats.pages
            )}
          </p>
          <p
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              marginTop: "5px",
              letterSpacing: "0.04em",
            }}
          >
            pages {new Date().getFullYear()}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => navigate("/shelf")}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: "22px",
              fontWeight: 500,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {shelfCount}
          </p>
          <p
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              marginTop: "5px",
              letterSpacing: "0.04em",
            }}
          >
            on shelf
          </p>
        </div>
      </div>

      {/* Roll CTA */}
      <div
        className="rounded-2xl"
        onClick={() => navigate("/roll")}
        style={{
          padding: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse at top right, var(--orange-glow), transparent 60%), rgba(232,104,42,0.05)",
          border: "1px solid var(--orange-dim)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span
            style={{
              fontSize: "14.5px",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            Roll your next book
          </span>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
            {shelfCount} on your shelf
          </span>
        </div>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "var(--orange)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mono,
            fontSize: "16px",
            fontWeight: 500,
            color: "#1a1a1a",
            boxShadow: "0 8px 20px rgba(232,104,42,0.35)",
          }}
        >
          🎲
        </div>
      </div>

      {/* Recently read */}
      {recentBooks.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "13px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
              }}
            >
              Recently Read
            </p>
            <button
              onClick={() => navigate("/library")}
              style={{
                fontFamily: mono,
                color: "var(--orange-soft, #f0905c)",
                fontSize: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              See all →
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {recentBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                style={{ flexShrink: 0, width: "68px", cursor: "pointer" }}
              >
                {getCoverUrl(book, "S") ? (
                  <img
                    src={getCoverUrl(book, "S")}
                    alt="cover"
                    style={{
                      width: "68px",
                      height: "98px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "6px",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "68px",
                      height: "98px",
                      borderRadius: "6px",
                      marginBottom: "6px",
                      background:
                        TILE_COLOURS[
                          book.title.charCodeAt(0) % TILE_COLOURS.length
                        ],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                    }}
                  >
                    📖
                  </div>
                )}
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "10px",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    marginBottom: "3px",
                  }}
                >
                  {book.title}
                </p>
                <Stars rating={book.rating} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
