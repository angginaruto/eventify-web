// src/pages/TransactionPage.tsx
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getMyTransactionsApi } from "@/services/transaction.service";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionPage() {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";

  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: getMyTransactionsApi,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">Your event ticket history</p>
      </div>

      {/* Success banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <span>✅</span>
          <span>Transaction successful! Your ticket has been confirmed.</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500 text-sm">Failed to load transactions.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && transactions?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎟️</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tickets yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            You haven't purchased any tickets yet.
          </p>
          <Link
            to="/"
            className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      )}

      {/* Transaction list */}
      {!isLoading && !isError && transactions && transactions.length > 0 && (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-4">
                {/* Event image */}
                <Link
                  to={`/events/${tx.eventId}`}
                  className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl shrink-0 hover:opacity-80 transition-opacity"
                >
                  {tx.event.imageUrl ? (
                    <img
                      src={tx.event.imageUrl}
                      alt={tx.event.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    "🎪"
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <Link
                      to={`/events/${tx.eventId}`}
                      className="font-semibold text-gray-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {tx.event.title}
                    </Link>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0
                      ${
                        tx.status === "SUCCESS"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    📅{" "}
                    {format(new Date(tx.event.startDate), "dd MMM yyyy, HH:mm")}
                  </p>
                  <p className="text-xs text-gray-500">
                    📍 {tx.event.location}
                  </p>

                  {/* Price breakdown */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <p>
                        {tx.quantity} ticket{tx.quantity > 1 ? "s" : ""}
                      </p>
                      {tx.discountAmount > 0 && (
                        <p className="text-green-600">
                          Discount: − {formatIDR(tx.discountAmount)}
                          {tx.coupon && ` (${tx.coupon.discount}% coupon)`}
                        </p>
                      )}
                      {tx.pointsUsed > 0 && (
                        <p className="text-green-600">
                          Points: − {formatIDR(tx.pointsUsed)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total paid</p>
                      <p
                        className={`text-sm font-bold ${tx.finalPrice === 0 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {tx.finalPrice === 0
                          ? "Free"
                          : formatIDR(tx.finalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Transaction date */}
                  <p className="text-xs text-gray-300 mt-2">
                    Purchased on {format(new Date(tx.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
