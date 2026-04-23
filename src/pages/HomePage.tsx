// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { getEventsApi, getCategoriesApi } from "@/services/event.service";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams(); // ambil data dari url
  const [searchInput, setSearchInput] = useState(
    // nilai input search yang langsung terikat ke form input
    searchParams.get("search") || "",
  );
  const [locationInput, setLocationInput] = useState(
    // nilai input location yang langsung terikat ke form input
    searchParams.get("location") || "",
  );

  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedLocation = useDebounce(locationInput, 300);

  const page = Number(searchParams.get("page") || "1");
  const categoryId = searchParams.get("categoryId") || undefined;
  const type = (searchParams.get("type") as "free" | "paid") || undefined;

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page"); // kalau search berubah kembali ke page 1
    setSearchParams(next);
  }

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  }

  function clearAllFilters() {
    setSearchInput("");
    setLocationInput("");
    setSearchParams({});
  }

  // sync debounced search ke URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      next.set("search", debouncedSearch);
    } else {
      next.delete("search");
    }
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [debouncedSearch]);

  // sync debounced location ke URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedLocation) {
      next.set("location", debouncedLocation);
    } else {
      next.delete("location");
    }
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [debouncedLocation]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: Infinity,
  });

  const { data, isLoading, isError } = useQuery({
    // dari tanstack query untuk fetch data events
    queryKey: [
      // refetch jika salah satu berubah
      "events",
      debouncedSearch,
      categoryId,
      type,
      debouncedLocation,
      page,
    ],
    queryFn: () =>
      getEventsApi({
        search: debouncedSearch || undefined, // tidak kirim "" ke api oleh karenanya undefined
        categoryId,
        type,
        location: debouncedLocation || undefined, // tidak kirim "" ke api oleh karenanya undefined
        page,
        limit: 9,
      }),
  });

  const hasActiveFilter = !!(
    debouncedSearch ||
    categoryId ||
    type ||
    debouncedLocation
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Discover Amazing Events Near You
            </h1>
            <p className="text-indigo-200 text-lg mb-8">
              Find and book tickets for concerts, conferences, workshops, and
              more.
            </p>

            {/* Search bar */}
            <div className="relative bg-white rounded-xl shadow-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-11 pr-10 py-4 rounded-xl text-gray-900 text-sm outline-none shadow-lg"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
                {hasActiveFilter && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Location filter */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Location
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    📍
                  </span>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Bandung, Jakarta"
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-indigo-400"
                  />
                  {locationInput && (
                    <button
                      onClick={() => setLocationInput("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Type filter */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Price
                </p>
                <div className="space-y-1">
                  {[
                    { label: "All", value: undefined },
                    { label: "Free", value: "free" },
                    { label: "Paid", value: "paid" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => updateParam("type", opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${
                          type === opt.value || (!type && !opt.value)
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Category
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam("categoryId", undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        !categoryId
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    All categories
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam("categoryId", cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${
                          categoryId === cat.id
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Event grid */}
          <div className="flex-1 min-w-0">
            {/* Active filters badge */}
            {hasActiveFilter && (
              <div className="flex flex-wrap gap-2 mb-4">
                {debouncedSearch && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
                    Search: "{debouncedSearch}"
                    <button
                      onClick={() => setSearchInput("")}
                      className="hover:text-indigo-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {debouncedLocation && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
                    📍 {debouncedLocation}
                    <button
                      onClick={() => setLocationInput("")}
                      className="hover:text-indigo-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {type && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
                    {type === "free" ? "Free" : "Paid"}
                    <button
                      onClick={() => updateParam("type", undefined)}
                      className="hover:text-indigo-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {categoryId && categories && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1">
                    {categories.find((c) => c.id === categoryId)?.name}
                    <button
                      onClick={() => updateParam("categoryId", undefined)}
                      className="hover:text-indigo-800"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Result info */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {isLoading
                  ? "Loading..."
                  : `${data?.meta.total ?? 0} events found`}
              </p>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && (
              <EmptyState
                title="Failed to load events"
                description="Something went wrong. Please try again later."
              />
            )}

            {/* Empty */}
            {!isLoading && !isError && data?.data.length === 0 && (
              <EmptyState
                title="No events found"
                description={
                  hasActiveFilter
                    ? "Try adjusting your search or filters."
                    : "No events available at the moment."
                }
                action={
                  hasActiveFilter ? (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      Clear filters
                    </button>
                  ) : undefined
                }
              />
            )}

            {/* Events */}
            {!isLoading && !isError && data && data.data.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {data.data.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={data.meta.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
