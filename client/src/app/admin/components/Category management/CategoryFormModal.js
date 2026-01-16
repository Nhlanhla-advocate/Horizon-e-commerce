'use client';

export default function categoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onInputChange,
    editingCategory,
    categories,
    getParentOptions
}) {
    if (!isOpen) return null;

    return (
        <div
            className="admin-modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5',
                display: 'flex',
                alignItems: 'center',
                zIndex:
            }}
        >
            <div 
                className="admin-modal"
                onClick={ (e) => e.stopProopagation()}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overFlowy: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                >
        </div>
    )
}