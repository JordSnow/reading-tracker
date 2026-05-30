import { useState } from 'react'
import { createPortal } from 'react-dom'
import { updateBook } from '../db/db'

function BookDetailModal({ book, onClose, onUpdate, extraActions }) {
    const [rollEligible, setRollEligible] = useState(book.roll_eligible)
    const [notes, setNotes] = useState(book.notes || '')
    const [genre, setGenre] = useState(book.genre || '')
    const [saving, setSaving] = useState(false)

    function formatDate(dateStr) {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    async function handleSave() {
        setSaving(true)
        await updateBook(book.id, {
            roll_eligible: rollEligible,
            notes,
            genre,
            is_unreleased: book.is_unreleased,
            is_standalone: book.is_standalone,
        })
        setSaving(false)
        onUpdate()
        onClose()
    }

    return createPortal(
        <div className="fixed inset-0 flex flex-col justify-end sm:justify-center items-center z-50"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
                 style={{ maxHeight: '90vh', background: 'rgba(20,25,40,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Header */}
                <div className="p-4 flex items-center justify-between shrink-0"
                     style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <h2 className="font-semibold text-white">Book Details</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
                </div>

                <div className="overflow-y-auto flex-1">
                    {/* Cover + title */}
                    <div className="flex gap-4 p-5">
                        {book.cover_i ? (
                            <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                                 alt="cover" className="w-20 h-28 object-cover rounded-xl shadow-lg shrink-0" />
                        ) : (
                            <div className="w-20 h-28 rounded-xl flex items-center justify-center text-center p-2 shrink-0"
                                 style={{ background: 'rgba(232,104,42,0.3)' }}>
                                <span className="text-white text-xs font-bold">{book.title}</span>
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">{book.title}</h3>
                            <p className="text-white/50 text-sm mt-1">{book.author}</p>
                            {book.page_count && (
                                <p className="text-white/30 text-xs mt-1">{book.page_count} pages</p>
                            )}
                            {book.release_year && (
                                <p className="text-white/30 text-xs mt-1">Published {book.release_year}</p>
                            )}
                            {book.series_name && (
                                <p className="text-white/30 text-xs mt-1">Series: {book.series_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="px-5 pb-4 space-y-2">
                        {book.added_to_shelf_date && (
                            <div className="flex justify-between text-sm">
                                <span className="text-white/30">Added</span>
                                <span className="text-white/60">{formatDate(book.added_to_shelf_date)}</span>
                            </div>
                        )}
                        {book.started_date && (
                            <div className="flex justify-between text-sm">
                                <span className="text-white/30">Started</span>
                                <span className="text-white/60">{formatDate(book.started_date)}</span>
                            </div>
                        )}
                        {book.completed_date && (
                            <div className="flex justify-between text-sm">
                                <span className="text-white/30">Completed</span>
                                <span className="text-white/60">{formatDate(book.completed_date)}</span>
                            </div>
                        )}
                        {book.rating && (
                            <div className="flex justify-between text-sm">
                                <span className="text-white/30">Rating</span>
                                <span style={{ color: '#E8682A' }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>
                            </div>
                        )}
                    </div>

                    {/* Editable fields */}
                    <div className="px-5 pb-4 space-y-3"
                         style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>

                        <div>
                            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Genre</label>
                            <input
                                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                value={genre.includes(':') || genre.includes('=') ? '' : genre}
                                onChange={e => setGenre(e.target.value)}
                                placeholder="e.g. Fantasy, Sci-Fi..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Notes</label>
                            <textarea
                                className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none resize-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                                rows={3}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Any notes about this book..."
                            />
                        </div>

                        {/* Roll eligible toggle */}
                        {book.status === 'Shelf' && (
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium text-white">Roll eligible</p>
                                    <p className="text-xs text-white/30">Include in random roll</p>
                                </div>
                                <button
                                    onClick={() => setRollEligible(!rollEligible)}
                                    className="w-12 h-6 rounded-full transition-all relative"
                                    style={{ background: rollEligible ? '#E8682A' : 'rgba(255,255,255,0.15)' }}
                                >
                                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                                         style={{ left: rollEligible ? '1.75rem' : '0.25rem' }} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Extra actions (passed in per screen) */}
                    {extraActions && (
                        <div className="px-5 pb-4 space-y-2"
                             style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                            {extraActions}
                        </div>
                    )}
                </div>

                {/* Save button */}
                <div className="p-4 shrink-0"
                     style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={handleSave} disabled={saving}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                            style={{ background: '#E8682A' }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default BookDetailModal