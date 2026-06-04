import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookById, updateBook, deleteBook, getCoverUrl } from "../db/db";
import ConfirmModal from "../components/ConfirmModal";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [rollEligible, setRollEligible] = useState(false);
  const [notes, setNotes] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [startedDate, setStartedDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function load() {
      const b = await getBookById(parseInt(id));
      if (!b) return navigate(-1);
      setBook(b);
      setRollEligible(b.roll_eligible);
      setNotes(b.notes || "");
      setGenre(
        b.genre?.includes(":") || b.genre?.includes("=") ? "" : b.genre || "",
      );
      setRating(b.rating || 0);
      setStartedDate(
        b.started_date
          ? new Date(b.started_date).toISOString().split("T")[0]
          : "",
      );
      setCompletedDate(
        b.completed_date
          ? new Date(b.completed_date).toISOString().split("T")[0]
          : "",
      );
      // trigger slide-in only after book is loaded and painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }
    load();
  }, [id, navigate]);

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
    navigate(-1);
  }

  function handleBack() {
    setVisible(false);
    setTimeout(() => navigate(-1), 280);
  }

  function handleDelete() {
    setConfirmModal({
      message: "Remove this book permanently?",
      onConfirm: async () => {
        await deleteBook(book.id);
        setConfirmModal(null);
        navigate(-1);
      },
    });
  }

  if (!book) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "#1a1a1a",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            position: "sticky",
            top: 0,
            background: "#1a1a1a",
            zIndex: 10,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#E8682A",
              fontSize: "15px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleDelete}
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>

        {/* Cover + title hero */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "280px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {getCoverUrl(book) ? (
            <>
              <img
                src={getCoverUrl(book, "L")}
                alt="cover"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "blur(20px) brightness(0.4)",
                  transform: "scale(1.1)",
                }}
              />
              <img
                src={getCoverUrl(book)}
                alt="cover"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  height: "200px",
                  width: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "rgba(232,104,42,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
              }}
            >
              📖
            </div>
          )}
        </div>

        {/* Title block */}
        <div style={{ padding: "20px 20px 8px", textAlign: "center" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: "6px",
            }}
          >
            {book.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {book.author}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {book.page_count && (
              <span
                style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}
              >
                {book.page_count} pages
              </span>
            )}
            {book.release_year && (
              <span
                style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}
              >
                Published {book.release_year}
              </span>
            )}
            {book.series_name && (
              <span
                style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}
              >
                {book.series_name}
              </span>
            )}
          </div>
        </div>

        {/* Editable fields */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Genre */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Genre
            </label>
            <input
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Fantasy, Sci-Fi..."
            />
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Notes
            </label>
            <textarea
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this book..."
            />
          </div>

          {/* Dates */}
          {(book.status === "Table" || book.status === "Library") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  book.status === "Library" ? "1fr 1fr" : "1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Started
                </label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "#fff",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  value={startedDate}
                  onChange={(e) => setStartedDate(e.target.value)}
                />
              </div>
              {book.status === "Library" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Completed
                  </label>
                  <input
                    type="date"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "#fff",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Rating */}
          {book.status === "Library" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Rating
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star === rating ? 0 : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: "28px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color:
                        star <= (hoverRating || rating)
                          ? "#E8682A"
                          : "rgba(255,255,255,0.15)",
                      transform:
                        star <= (hoverRating || rating)
                          ? "scale(1.2)"
                          : "scale(1)",
                      transition: "all 0.15s",
                      filter:
                        star <= (hoverRating || rating)
                          ? "drop-shadow(0 0 6px rgba(232,104,42,0.5))"
                          : "none",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p
                  style={{
                    color: "#E8682A",
                    fontSize: "12px",
                    marginTop: "6px",
                  }}
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
          )}

          {/* Roll eligible */}
          {book.status === "Shelf" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "14px",
                    marginBottom: "2px",
                  }}
                >
                  Roll eligible
                </p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                  Include in random roll
                </p>
              </div>
              <button
                onClick={() => setRollEligible(!rollEligible)}
                style={{
                  width: "48px",
                  height: "26px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: rollEligible
                    ? "#E8682A"
                    : "rgba(255,255,255,0.15)",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                    left: rollEligible ? "25px" : "3px",
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Save */}
        <div style={{ padding: "8px 20px 24px", marginTop: "auto" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "#E8682A",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}
