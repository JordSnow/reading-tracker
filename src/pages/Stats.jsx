import { useState, useEffect } from 'react'
import { db } from '../db/db'

function StatCard({ label, value, sub }) {
    return (
        <div className="glass rounded-2xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
    )
}

function Stats() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [stats, setStats] = useState(null)
    const availableYears = [2024, 2025, 2026, 2027]

    useEffect(() => {
        async function load() {
            const result = await db.query(
                `SELECT * FROM books WHERE status = 'Library' AND EXTRACT(YEAR FROM completed_date) = $1`,
                [year]
            )
            const books = result.rows
            if (books.length === 0) { setStats(null); return }

            const totalPages = books.reduce((sum, b) => sum + (b.page_count || 0), 0)
            const avgPages = Math.round(totalPages / books.length)
            const withPages = books.filter(b => b.page_count)
            const longest = withPages.length ? withPages.reduce((a, b) => a.page_count > b.page_count ? a : b) : null
            const shortest = withPages.length ? withPages.reduce((a, b) => a.page_count < b.page_count ? a : b) : null

            const authorCounts = {}
            books.forEach(b => { if (b.author) authorCounts[b.author] = (authorCounts[b.author] || 0) + 1 })
            const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]

            const rollResult = await db.query(
                `SELECT COUNT(*) FILTER (WHERE randomly_rolled = true) as rolled,
                COUNT(*) FILTER (WHERE randomly_rolled = true AND status = 'Library') as accepted
         FROM books`
            )
            const totalRolled = parseInt(rollResult.rows[0].rolled) || 0
            const totalAccepted = parseInt(rollResult.rows[0].accepted) || 0
            const rollSuccessRate = totalRolled > 0 ? Math.round((totalAccepted / totalRolled) * 100) : 0

            setStats({ books: books.length, totalPages, avgPages, longest, shortest,
                topAuthor: topAuthor ? { name: topAuthor[0], count: topAuthor[1] } : null,
                rollSuccessRate, totalRolled, totalAccepted })
        }
        load()
    }, [year])

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white mb-4">Stats</h1>

            <select
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
            >
                {availableYears.map(y => <option key={y} value={y} style={{ background: '#0d1117' }}>{y}</option>)}
            </select>

            {!stats ? (
                <p className="text-white/30 text-sm text-center mt-16">No books completed in {year} yet.</p>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Books read" value={stats.books} />
                        <StatCard label="Pages read" value={stats.totalPages.toLocaleString()} />
                    </div>
                    {stats.longest && <StatCard label="Longest book" value={stats.longest.title} sub={`${stats.longest.page_count} pages`} />}
                    {stats.shortest && <StatCard label="Shortest book" value={stats.shortest.title} sub={`${stats.shortest.page_count} pages`} />}
                    <StatCard label="Average pages" value={stats.avgPages} />
                    {stats.topAuthor && <StatCard label="Most read author" value={stats.topAuthor.name} sub={`${stats.topAuthor.count} books`} />}
                    <StatCard label="Random roll success rate" value={`${stats.rollSuccessRate}%`} sub={`${stats.totalAccepted} of ${stats.totalRolled} rolls accepted`} />

                    <div className="glass rounded-2xl p-5 text-center">
                        <p className="font-semibold text-white mb-1">Yearly Wrapped</p>
                        <p className="text-white/30 text-xs mb-4">Your personalised reading summary for {year}</p>
                        <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-white/20 text-sm italic">Coming soon...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Stats