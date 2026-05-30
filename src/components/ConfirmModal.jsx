import { createPortal } from 'react-dom'

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
                 style={{ background: 'rgba(20,25,40,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-white text-sm text-center">{message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onCancel}
                            className="py-2.5 rounded-xl text-sm font-semibold text-white/70 glass">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                            className="py-2.5 rounded-xl text-sm font-semibold text-white"
                            style={{ background: danger ? '#dc2626' : '#E8682A' }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ConfirmModal