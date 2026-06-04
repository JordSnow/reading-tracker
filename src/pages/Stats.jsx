import { db } from "../db/db";
import { useState, useEffect, useMemo } from "react";

function StatCard({ label, value, sub }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function computeStats(books) {
  if (books.length === 0) return null;

  const totalPages = books.reduce((sum, b) => sum + (b.page_count || 0), 0);
  const avgPages = Math.round(totalPages / books.length);

  const withPages = books.filter((b) => b.page_count);
  const longest = withPages.length
    ? withPages.reduce((a, b) => (a.page_count > b.page_count ? a : b))
    : null;
  const shortest = withPages.length
    ? withPages.reduce((a, b) => (a.page_count < b.page_count ? a : b))
    : null;

  const authorCounts = {};
  books.forEach((b) => {
    if (b.author) authorCounts[b.author] = (authorCounts[b.author] || 0) + 1;
  });
  const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];

  const booksWithDates = books.filter(
    (b) => b.started_date && b.completed_date,
  );
  const avgPagesPerDay = booksWithDates.length
    ? Math.round(
        booksWithDates.reduce((sum, b) => {
          const days = Math.max(
            1,
            (new Date(b.completed_date) - new Date(b.started_date)) /
              (1000 * 60 * 60 * 24),
          );
          return sum + (b.page_count || 0) / days;
        }, 0) / booksWithDates.length,
      )
    : null;

  const avgDaysPerBook = booksWithDates.length
    ? Math.round(
        booksWithDates.reduce((sum, b) => {
          const days = Math.max(
            1,
            (new Date(b.completed_date) - new Date(b.started_date)) /
              (1000 * 60 * 60 * 24),
          );
          return sum + days;
        }, 0) / booksWithDates.length,
      )
    : null;

  return {
    books: books.length,
    totalPages,
    avgPages,
    longest,
    shortest,
    topAuthor: topAuthor ? { name: topAuthor[0], count: topAuthor[1] } : null,
    avgPagesPerDay,
    avgDaysPerBook,
    allBooks: books,
  };
}

function MonthlyBreakdown({ books, year }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
        Monthly Breakdown {year}
      </p>
      <div className="space-y-3">
        {Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthBooks = books.filter((b) => {
            if (!b.completed_date) return false;
            const d = new Date(b.completed_date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          });
          const monthPages = monthBooks.reduce(
            (sum, b) => sum + (b.page_count || 0),
            0,
          );
          const monthName = new Date(year, i, 1).toLocaleDateString("en-GB", {
            month: "short",
          });
          if (monthBooks.length === 0) return null;
          return (
            <div key={month} className="flex items-center gap-3">
              <span className="text-white/30 text-xs w-8">{monthName}</span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (monthBooks.length /
                        Math.max(
                          ...Array.from({ length: 12 }, (_, j) => {
                            return books.filter(
                              (b) =>
                                b.completed_date &&
                                new Date(b.completed_date).getMonth() === j,
                            ).length;
                          }),
                        )) *
                        100,
                    )}%`,
                    background: "#E8682A",
                  }}
                />
              </div>
              <span className="text-white/50 text-xs w-14 text-right">
                {monthBooks.length} book{monthBooks.length !== 1 ? "s" : ""}
              </span>
              <span className="text-white/30 text-xs w-16 text-right">
                {monthPages.toLocaleString()}p
              </span>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
}

function StatsGrid({ stats }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Books read" value={stats.books} />
        <StatCard
          label="Pages read"
          value={stats.totalPages.toLocaleString()}
        />
      </div>
      {stats.longest && (
        <StatCard
          label="Longest book"
          value={stats.longest.title}
          sub={`${stats.longest.page_count} pages`}
        />
      )}
      {stats.shortest && (
        <StatCard
          label="Shortest book"
          value={stats.shortest.title}
          sub={`${stats.shortest.page_count} pages`}
        />
      )}
      <StatCard label="Avg pages per book" value={stats.avgPages} />
      {stats.avgPagesPerDay && (
        <StatCard
          label="Avg pages per day"
          value={stats.avgPagesPerDay}
          sub="from start to finish date"
        />
      )}
      {stats.avgDaysPerBook && (
        <StatCard
          label="Avg days per book"
          value={stats.avgDaysPerBook}
          sub="from start to finish date"
        />
      )}
      {stats.topAuthor && (
        <StatCard
          label="Most read author"
          value={stats.topAuthor.name}
          sub={`${stats.topAuthor.count} book${stats.topAuthor.count !== 1 ? "s" : ""}`}
        />
      )}
    </div>
  );
}

function Stats() {
  const [tab, setTab] = useState("year");
  const [year, setYear] = useState(new Date().getFullYear());
  const [allBooks, setAllBooks] = useState([]);
  const currentYear = new Date().getFullYear();
  const availableYears = [2023, 2024, 2025, 2026, 2027];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    async function load() {
      const result = await db.query(
        `SELECT * FROM books WHERE status = 'Library' ORDER BY completed_date DESC`,
      );
      setAllBooks(result.rows);
    }
    load();
  }, []);

  const tabs = [
    { key: "alltime", label: "All Time" },
    { key: "year", label: "Yearly" },
    { key: "month", label: "Monthly" },
  ];

  const filteredBooks = useMemo(() => {
    if (tab === "alltime") return allBooks;
    if (tab === "year")
      return allBooks.filter((b) => {
        if (!b.completed_date) return false;
        return new Date(b.completed_date).getFullYear() === year;
      });
    if (tab === "month")
      return allBooks.filter((b) => {
        if (!b.completed_date) return false;
        const d = new Date(b.completed_date);
        return d.getFullYear() === year && d.getMonth() === selectedMonth;
      });
    return allBooks;
  }, [tab, year, selectedMonth, allBooks]);

  const stats = computeStats(filteredBooks);

  const rollResult = allBooks.filter((b) => b.randomly_rolled);
  const rollSuccessRate =
    rollResult.length > 0
      ? Math.round(
          (rollResult.filter((b) => b.status === "Library").length /
            rollResult.length) *
            100,
        )
      : 0;

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
        Stats
      </h1>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.key ? "#E8682A" : "transparent",
              color: tab === t.key ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Year selector — show for Year tab only */}
      {tab === "year" && (
        <select
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "16px",
          }}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y} style={{ background: "#0d1117" }}>
              {y}
            </option>
          ))}
        </select>
      )}

      {/* Month selector — show for Month tab */}
      {tab === "month" && (
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "16px",
            }}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y} style={{ background: "#0d1117" }}>
                {y}
              </option>
            ))}
          </select>
          <select
            className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "16px",
            }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i} style={{ background: "#0d1117" }}>
                {new Date(2024, i, 1).toLocaleDateString("en-GB", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* No data state */}
      {!stats ? (
        <p className="text-white/30 text-sm text-center mt-16">
          No books completed{" "}
          {tab === "alltime"
            ? "yet"
            : tab === "month"
              ? "this month"
              : `in ${year}`}
          .
        </p>
      ) : (
        <div className="space-y-3">
          <StatsGrid stats={stats} />

          {/* Roll success rate */}
          <div className="glass rounded-2xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
              Random roll success rate
            </p>
            <p className="text-2xl font-bold text-white">{rollSuccessRate}%</p>
            <p className="text-white/40 text-xs mt-1">
              {rollResult.length} total rolls
            </p>
          </div>

          {/* Monthly breakdown — only show on Year or All Time tab */}
          {tab !== "month" && (
            <MonthlyBreakdown
              books={tab === "alltime" ? allBooks : filteredBooks}
              year={year}
            />
          )}

          {/* Yearly Wrapped */}
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-semibold text-white mb-1">Yearly Wrapped</p>
            <p className="text-white/30 text-xs mb-4">
              Your personalised reading summary
            </p>
            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-white/20 text-sm italic">Coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stats;
