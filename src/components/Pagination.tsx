// src/components/Pagination.tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page, // halaman saat ini
  totalPages, // total halaman
  onPageChange, // opsi buat pindah halaman
}: PaginationProps) {
  if (totalPages <= 1) return null; // jika page 1 halaman paginasi tidak akan muncul

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600
          hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>

      {/* Pages */}
      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 text-gray-400 text-sm">...</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 text-sm rounded-lg transition-colors
                ${
                  p === page
                    ? "bg-indigo-600 text-white font-medium"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600
          hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
