import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRollEligibleBooks, acceptRoll, getTableCount } from "../db/db";
import confetti from "canvas-confetti";
import { TILE_COLOURS } from "../constants";

function BookCover({ book, size = "md", dimmed = false }) {
  const sizes = {
    sm: "w-24 h-36",
    md: "w-36 h-52",
    lg: "w-44 h-64",
  };
  return (
    <div
      className={`${sizes[size]} rounded-2xl overflow-hidden shadow-2xl shrink-0 transition-all duration-300 ${dimmed ? "opacity-40 scale-90" : "opacity-100 scale-100"}`}
    >
      {book.cover_i ? (
        <img
          src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
          alt="cover"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center p-2 text-center"
          style={{
            background:
              TILE_COLOURS[book.title.charCodeAt(0) % TILE_COLOURS.length],
          }}
        >
          <span className="text-white font-bold text-sm leading-tight">
            {book.title}
          </span>
        </div>
      )}
    </div>
  );
}

function Roll() {
  const [eligibleBooks, setEligibleBooks] = useState([]);
  const [hasTableBook, setHasTableBook] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | spinning | result | accepted
  const [carouselBooks, setCarouselBooks] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const [finalBook, setFinalBook] = useState(null);
  const spinRef = useRef(null);
  const navigate = useNavigate();
  const cachedCarousel = useRef([]);

  useEffect(() => {
    async function load() {
      const books = await getRollEligibleBooks();
      setEligibleBooks(books);
      const count = await getTableCount();
      setHasTableBook(count >= 1);
    }
    load();
  }, []);

  function buildCarousel(books) {
    if (cachedCarousel.current.length === 0) {
      const shuffled = [...books].sort(() => Math.random() - 0.5);
      const repeated = [];
      while (repeated.length < 30) {
        repeated.push(...shuffled);
      }
      cachedCarousel.current = repeated.slice(0, 30);
    }
    return cachedCarousel.current;
  }

  function handleRoll() {
    if (eligibleBooks.length === 0) return;
    cachedCarousel.current = []; // clear cache so each roll reshuffles
    const carousel = buildCarousel(eligibleBooks);
    setCarouselBooks(carousel);
    setCenterIndex(0);
    setPhase("spinning");

    let currentIdx = 0;
    let tick = 0;
    const totalTicks = 25;

    function next() {
      tick++;
      currentIdx = (currentIdx + 1) % carousel.length;
      setCenterIndex(currentIdx);

      if (tick < totalTicks) {
        // Start fast, slow down
        const delay = 80 + Math.pow(tick / totalTicks, 2) * 500;
        spinRef.current = setTimeout(next, delay);
      } else {
        // Use whatever book is showing at the end of the spin
        const picked = carousel[currentIdx];
        setFinalBook(picked);
        setPhase("result");
      }
    }

    spinRef.current = setTimeout(next, 80);
  }

  function handleReroll() {
    clearTimeout(spinRef.current);
    setPhase("idle");
    setFinalBook(null);
    setTimeout(() => handleRoll(), 50);
  }

  async function handleAccept() {
    await acceptRoll(finalBook.id);
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#E8682A", "#ffffff", "#ffd700", "#ff6b6b"],
    });
    setPhase("accepted");
  }

  if (hasTableBook) {
    return (
      <div className="text-center mt-16 space-y-4">
        <p className="text-4xl">📖</p>
        <p className="text-white font-semibold">
          You're already reading something!
        </p>
        <p className="text-white/40 text-sm">
          Finish your current book before rolling a new one.
        </p>
        <button
          onClick={() => navigate("/table")}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#E8682A" }}
        >
          Go to The Table
        </button>
      </div>
    );
  }

  if (eligibleBooks.length === 0) {
    return (
      <div className="text-center mt-16 space-y-4">
        <p className="text-4xl">🎲</p>
        <p className="text-white font-semibold">No eligible books to roll!</p>
        <p className="text-white/40 text-sm">
          Add some roll-eligible books to your shelf first.
        </p>
        <button
          onClick={() => navigate("/shelf")}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#E8682A" }}
        >
          Go to Shelf
        </button>
      </div>
    );
  }

  if (phase === "accepted") {
    return (
      <div className="text-center mt-16 space-y-4">
        <p className="text-4xl">🎉</p>
        <p className="text-white font-semibold">Enjoy your read!</p>
        <p className="text-xl font-bold text-white">{finalBook.title}</p>
        <p className="text-white/40 text-sm">{finalBook.author}</p>
        <button
          onClick={() => navigate("/table")}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#E8682A" }}
        >
          Go to The Table
        </button>
      </div>
    );
  }

  // Get 5 visible books centred around centerIndex for the carousel
  const visible =
    phase === "spinning" && carouselBooks.length > 0
      ? [-2, -1, 0, 1, 2].map((offset) => {
          const idx =
            (centerIndex + offset + carouselBooks.length) %
            carouselBooks.length;
          return { book: carouselBooks[idx], offset };
        })
      : null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 200,
            fontSize: "28px",
            letterSpacing: "2px",
            color: "#f0efee",
          }}
        >
          Random Roll
        </h1>
        <p className="text-white/30 text-sm mt-1">
          {eligibleBooks.length} books eligible
        </p>
      </div>

      {/* Carousel / display area */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: 260 }}
      >
        {phase === "idle" && (
          <div className="text-center space-y-3">
            <p className="text-6xl">🎲</p>
            <p className="text-white/30 text-sm">
              Hit roll to pick your next book
            </p>
          </div>
        )}

        {phase === "spinning" && visible && (
          <div className="flex items-center justify-center gap-3 w-full">
            {visible.map(({ book, offset }) => (
              <BookCover
                key={`${book.id}-${offset}`}
                book={book}
                size={offset === 0 ? "md" : "sm"}
                dimmed={offset !== 0}
              />
            ))}
          </div>
        )}

        {phase === "result" && finalBook && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              Your next read is...
            </p>
            <BookCover book={finalBook} size="lg" />
          </div>
        )}
      </div>

      {/* Book info when result shown */}
      {phase === "result" && finalBook && (
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{finalBook.title}</h2>
          <p className="text-white/50 text-sm mt-1">{finalBook.author}</p>
          {finalBook.page_count && (
            <p className="text-white/30 text-xs mt-1">
              {finalBook.page_count} pages
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      {phase === "idle" && (
        <button
          onClick={handleRoll}
          className="w-full py-4 rounded-2xl text-lg font-bold text-white"
          style={{ background: "#E8682A" }}
        >
          🎲 Roll!
        </button>
      )}

      {phase === "spinning" && (
        <div className="space-y-3">
          <button
            disabled
            className="w-full py-4 rounded-2xl text-lg font-bold text-white/50 cursor-not-allowed"
            style={{ background: "rgba(232,104,42,0.3)" }}
          >
            Rolling...
          </button>
          <button
            onClick={() => {
              clearTimeout(spinRef.current);
              setPhase("idle");
              setFinalBook(null);
            }}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white/40 glass"
          >
            Cancel
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReroll}
              className="glass py-3 rounded-xl text-sm font-semibold text-white/80"
            >
              🔄 Reroll
            </button>
            <button
              onClick={handleAccept}
              className="py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#E8682A" }}
            >
              ✓ Accept
            </button>
          </div>
          <button
            onClick={() => {
              setPhase("idle");
              setFinalBook(null);
            }}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white/40 glass"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Roll;
