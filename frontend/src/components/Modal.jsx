import { createPortal } from 'react-dom'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content modal-wide"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    )
}
