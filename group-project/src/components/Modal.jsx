export function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} g>
        <button onClick={onClose} className="modal-close">
          &times;
        </button>

        {children}
      </div>
    </div>
  );
}
