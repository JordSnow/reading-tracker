import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBooksByStatus } from '../db/db'

function Home() {
    const [currentBook, setCurrentBook] = useState(null)
    const [recentBooks, setRecentBooks] = useState([])
    const [yearStats, setYearStats] = useState({ books: 0, pages: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        async function load() {
            const table = await getBooksByStatus('Table')
            setCurrentBook(table[0] || null)
            const library = await getBooksByStatus('Library')
            setRecentBooks(library.slice(0, 3))
            const currentYear = new Date().getFullYear()
            const yearBooks = library.filter(b => {
                if (!b.completed_date) return false
                return new Date(b.completed_date).getFullYear() === currentYear
            })
            const totalPages = yearBooks.reduce((sum, b) => sum + (b.page_count || 0), 0)
            setYearStats({ books: yearBooks.length, pages: totalPages })
        }
        load()
    }, [])

    function formatDate(dateStr) {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white text-center mb-6">Reading Tracker</h1>

            {/* Currently Reading */}
            {currentBook ? (
                <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                        {currentBook.cover_i ? (
                            <img
                                src={`https://covers.openlibrary.org/b/id/${currentBook.cover_i}-M.jpg`}
                                alt="cover"
                                className="w-16 h-22 object-cover rounded-xl shadow-lg shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-22 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                 style={{ background: 'rgba(232,104,42,0.2)' }}>
                                📖
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#E8682A' }}>Currently Reading</p>
                            <h2 className="font-bold text-white text-lg leading-tight">{currentBook.title}</h2>
                            <p className="text-white/50 text-sm">{currentBook.author}</p>
                            <p className="text-white/30 text-xs mt-1">Started {formatDate(currentBook.started_date)}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/table')}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: '#E8682A' }}
                    >
                        View Details
                    </button>
                </div>
            ) : (
                <div className="glass rounded-2xl p-6 text-center">
                    <p className="text-white/40 text-sm mb-3">Nothing on the table right now</p>
                    <button
                        onClick={() => navigate('/shelf')}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: '#E8682A' }}
                    >
                        Pick from Shelf
                    </button>
                </div>
            )}

            {/* Year stats */}
            <div className="glass rounded-2xl p-5">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Reading This Year</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-4xl font-bold text-white">{yearStats.books}</p>
                        <p className="text-white/40 text-xs mt-1">Books read</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-white">{yearStats.pages.toLocaleString()}</p>
                        <p className="text-white/40 text-xs mt-1">Pages read</p>
                    </div>
                </div>
            </div>

            {/* Roll button */}
            <button
                onClick={() => navigate('/roll')}
                className="w-full glass rounded-2xl py-4 text-sm font-semibold text-white/80 hover:text-white transition-all"
            >
                🎲 Roll Next Book
            </button>

            {/* Recent library */}
            {recentBooks.length > 0 && (
                <div className="glass rounded-2xl p-5">
                    <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Recent Library</p>
                    <div className="space-y-2">
                        {recentBooks.map(book => (
                            <div key={book.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                {book.cover_i ? (
                                    <img
                                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                                        alt="cover"
                                        className="w-8 h-11 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-8 h-11 rounded flex items-center justify-center text-xs"
                                         style={{ background: 'rgba(232,104,42,0.15)' }}>📖</div>
                                )}
                                <p className="text-white/70 text-sm">{book.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home