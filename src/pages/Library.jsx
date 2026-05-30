import { useState, useEffect } from 'react'
import { getBooksByStatus, deleteBook } from '../db/db'
import  ConfirmModal  from '../components/ConfirmModal'
import BookDetailModal from '../components/BookDetailModal'
import SortControl from '../components/SortControl'


const TILE_COLOURS = [
    'rgba(232,104,42,0.6)', 'rgba(99,102,241,0.6)', 'rgba(20,184,166,0.6)',
    'rgba(236,72,153,0.6)', 'rgba(234,179,8,0.6)', 'rgba(34,197,94,0.6)'
]

function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star} style={{ color: star <= rating ? '#E8682A' : 'rgba(255,255,255,0.15)' }}>★</span>
            ))}
        </div>
    )
}

async function handleDelete(id) {
    if (confirm('Remove this book from your library?')) {
        const rows = await getBooksByStatus('Library')
        setBooks(rows.filter(b => b.id !== id))
        await deleteBook(id)
    }
}

function Library() {
    const [books, setBooks] = useState([])
    const [filterQuery, setFilterQuery] = useState('')
    const [confirmModal, setConfirmModal] = useState(null)
    const [detailBook, setDetailBook] = useState(null)
    const [sortBy, setSortBy] = useState('completed')

    useEffect(() => {
        async function load() {
            const rows = await getBooksByStatus('Library')
            setBooks(rows)
        }
        load()
    }, [])

    function formatDate(dateStr) {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    async function handleDelete(id) {
        setConfirmModal({
            message: 'Remove this book from your library?',
            onConfirm: async () => {
                await deleteBook(id)
                setConfirmModal(null)
                const rows = await getBooksByStatus('Library')
                setBooks(rows)
            }
        })
    }

    const filteredBooks = books
        .filter(b =>
            b.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
            b.author.toLowerCase().includes(filterQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title)
            if (sortBy === 'pages') return (b.page_count || 0) - (a.page_count || 0)
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
            return new Date(b.completed_date) - new Date(a.completed_date)
        })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">The Library</h1>
                <SortControl
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: 'completed', label: 'Date completed' },
                        { value: 'title', label: 'A–Z' },
                        { value: 'pages', label: 'Page count' },
                        { value: 'rating', label: 'Rating' },
                    ]}
                />
            </div>

            <div className="relative">
                <span className="absolute left-3 top-2.5 text-white/30 text-sm">🔍</span>
                <input
                    className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Search completed books..."
                    value={filterQuery}
                    onChange={e => setFilterQuery(e.target.value)}
                />
            </div>

            {filteredBooks.length === 0 ? (
                <p className="text-white/30 text-sm text-center mt-16">
                    {books.length === 0 ? "You haven't finished any books yet." : "No books match your search."}
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {filteredBooks.map(book => (
                        <div key={book.id} className="glass rounded-2xl overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-[2/3] cursor-pointer"
                                 onClick={() => setDetailBook(book)}>
                                {book.cover_i ? (
                                    <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                                         alt="cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                                         style={{ background: TILE_COLOURS[book.title.charCodeAt(0) % TILE_COLOURS.length] }}>
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
                                    onClick={() => handleDelete(book.id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                    style={{ background: 'rgba(0,0,0,0.5)' }}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-3 flex flex-col" style={{ minHeight: '120px' }}>
                                <h3 className="font-semibold text-white text-sm leading-tight mb-0.5 line-clamp-2">{book.title}</h3>
                                <p className="text-white/40 text-xs mb-2">{book.author}</p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-white/30">Completed</span>
                                        <span className="text-white/60">{formatDate(book.completed_date)}</span>
                                    </div>
                                    {book.page_count && (
                                        <div className="flex justify-between">
                                            <span className="text-white/30">Pages</span>
                                            <span className="text-white/60">{book.page_count}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-white/30">Rolled</span>
                                        <span className="text-white/60">{book.randomly_rolled ? 'Yes' : 'No'}</span>
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
            {detailBook && (
                <BookDetailModal
                    book={detailBook}
                    onClose={() => setDetailBook(null)}
                    onUpdate={async () => {
                        const rows = await getBooksByStatus('Library')
                        setBooks(rows)
                    }}
                />
            )}
        </div>
    )
}

export default Library