import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBooksByStatus, updateProgress, finishBook } from '../db/db'

const TILE_COLOURS = [
    'rgba(232,104,42,0.6)', 'rgba(99,102,241,0.6)', 'rgba(20,184,166,0.6)',
    'rgba(236,72,153,0.6)', 'rgba(234,179,8,0.6)', 'rgba(34,197,94,0.6)'
]

function Table() {
    const [book, setBook] = useState(null)
    const [currentPage, setCurrentPage] = useState('')
    const [showFinishModal, setShowFinishModal] = useState(false)
    const [completedDate, setCompletedDate] = useState(today())
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const navigate = useNavigate()

    function today() {
        return new Date().toISOString().split('T')[0]
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    async function load() {
        const rows = await getBooksByStatus('Table')
        if (rows[0]) {
            setBook(rows[0])
            setCurrentPage(rows[0].current_page || '')
        }
    }

    useEffect(() => { load() }, [])

    async function handleUpdateProgress() {
        if (!currentPage) return
        await updateProgress(book.id, parseInt(currentPage))
        load()
    }

    async function handleFinish() {
        if (!completedDate) return
        await finishBook(book.id, completedDate, rating)
        setShowFinishModal(false)
        navigate('/')
    }

    function progressPercent() {
        if (!book?.page_count || !book?.current_page) return 0
        return Math.min(100, Math.round((book.current_page / book.page_count) * 100))
    }

    if (!book) {
        return (
            <div className="text-center mt-16">
                <p className="text-white/30 text-sm mb-4">Nothing on the table right now.</p>
                <button onClick={() => navigate('/shelf')}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: '#E8682A' }}>
                    Go to Shelf
                </button>
            </div>
        )
    }

    const tileColor = TILE_COLOURS[book.title.charCodeAt(0) % TILE_COLOURS.length]
    const pct = progressPercent()

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white mb-4">The Table</h1>

            <div className="glass rounded-2xl overflow-hidden">
                {/* Cover banner */}
                <div className="relative h-48 overflow-hidden">
                    {book.cover_i ? (
                        <>
                            <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                                 alt="cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))' }} />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white"
                             style={{ background: tileColor }}>
                             <span className="text-white font-bold text-sm leading-tight line-clamp-4">
                                 {book.title}
                             </span>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                        <h2 className="font-bold text-white text-xl leading-tight">{book.title}</h2>
                        <p className="text-white/60 text-sm">{book.author}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-white/30">Started</span>
                        <span className="text-right text-white/70">{formatDate(book.started_date)}</span>
                        {book.page_count && <>
                            <span className="text-white/30">Pages</span>
                            <span className="text-right text-white/70">{book.page_count}</span>
                        </>}
                        {book.randomly_rolled && <>
                            <span className="text-white/30">How picked</span>
                            <span className="text-right text-white/70">🎲 Randomly rolled</span>
                        </>}
                    </div>

                    {/* Progress bar */}
                    {book.page_count > 0 && (
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-white/30">Progress</span>
                                <span className="font-semibold" style={{ color: '#E8682A' }}>{pct}%</span>
                            </div>
                            <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: '#E8682A' }} />
                            </div>
                        </div>
                    )}

                    {/* Update progress */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="Current page..."
                            value={currentPage}
                            onChange={e => setCurrentPage(e.target.value)}
                        />
                        <button onClick={handleUpdateProgress}
                                className="glass px-4 py-2 rounded-xl text-sm font-semibold text-white/80">
                            Update
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={() => setShowFinishModal(true)}
                    className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
                    style={{ background: '#E8682A' }}>
                ✓ Mark as Finished
            </button>

            {/* Finish Modal */}
            {showFinishModal && (
                <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4"
                     style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                         style={{ background: 'rgba(20,25,40,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <h2 className="font-semibold text-white">Finish Book</h2>
                            <button onClick={() => setShowFinishModal(false)} className="text-white/40 hover:text-white text-xl">×</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Completed date</label>
                                <input type="date"
                                       className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                                       style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                       value={completedDate}
                                       onChange={e => setCompletedDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Rating (optional)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="text-3xl transition-all">
                                            <span style={{ color: star <= (hoverRating || rating) ? '#E8682A' : 'rgba(255,255,255,0.15)' }}>★</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleFinish}
                                    className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                                    style={{ background: '#E8682A' }}>
                                Save & Move to Library
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Table