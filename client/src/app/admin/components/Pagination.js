'use client';

import '../../assets/css/pagination.css';

export default function Pagination({ pagination, onPageChange, className = '' }) {
  const { page = 1, pages = 1, total = 0, limit = 20 } = pagination;

  if (!pagination || total === 0) {
    return null;
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages && newPage !== page) {
      onPageChange(newPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={`pagination-container ${className}`}>
      {/* Results Info - Always show */}
      <div className="pagination-results-info">
        Showing <span className="pagination-results-number">{startItem}</span> to{' '}
        <span className="pagination-results-number">{endItem}</span> of{' '}
        <span className="pagination-results-number">{total}</span> results
      </div>

      {/* Pagination Controls - Only show if more than 1 page */}
      {pages > 1 && (
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`pagination-btn ${
            page === 1
              ? 'pagination-btn-disabled'
              : 'pagination-btn-default'
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="pagination-page-numbers">
          {/* First page */}
          {page > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="pagination-btn pagination-btn-default"
              >
                1
              </button>
              {page > 4 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`pagination-btn ${
                pageNum === page
                  ? 'pagination-btn-active'
                  : 'pagination-btn-default'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Last page */}
          {page < pages - 2 && (
            <>
              {page < pages - 3 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                onClick={() => handlePageChange(pages)}
                className="pagination-btn pagination-btn-default"
              >
                {pages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pages}
          className={`pagination-btn ${
            page === pages
              ? 'pagination-btn-disabled'
              : 'pagination-btn-default'
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
      )}

      {/* Items per page selector - Always show */}
      <div className="pagination-items-per-page">
        <label className="pagination-items-per-page-label">Items per page:</label>
        <select
          value={limit}
          onChange={(e) => {
            const newLimit = parseInt(e.target.value);
            onPageChange(1, newLimit); // Reset to page 1 when limit changes
          }}
          className="pagination-items-per-page-select"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

