'use client';

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
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
      {/* Results Info - Always show */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      {/* Pagination Controls - Only show if more than 1 page */}
      {pages > 1 && (
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            page === 1
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {/* First page */}
          {page > 3 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                1
              </button>
              {page > 4 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pageNum === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Last page */}
          {page < pages - 2 && (
            <>
              {page < pages - 3 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(pages)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            page === pages
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
      )}

      {/* Items per page selector - Always show */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Items per page:</label>
        <select
          value={limit}
          onChange={(e) => {
            const newLimit = parseInt(e.target.value);
            onPageChange(1, newLimit); // Reset to page 1 when limit changes
          }}
          className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

