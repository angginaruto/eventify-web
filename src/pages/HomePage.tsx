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
import heroImage from "../assets/image.png";

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

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlLocation = searchParams.get("location") || "";

    // Cek apakah URL berbeda dari current state (untuk avoid infinite loop)
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
    }
    if (urlLocation !== locationInput) {
      setLocationInput(urlLocation);
    }
  }, [searchParams]);

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
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* ambient glow, single deliberate accent */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-130 w-205 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, #6d3cf5, transparent)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + search */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                Now live in 40+ cities
              </span>
              <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-white">
                Find your next
                <br />
                night out.
              </h1>
              <p className="mt-5 text-slate-400 text-lg max-w-md">
                Concerts, conferences, workshops, and gatherings worth showing
                up for — all in one place.
              </p>

              {/* Search bar */}
              <div className="relative mt-9 bg-[#12121e] rounded-xl border border-white/10 shadow-2xl shadow-black/40">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search events, artists, venues..."
                  className="w-full pl-11 pr-10 py-4 rounded-xl bg-transparent text-white placeholder:text-slate-500 text-sm outline-none"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Right: featured event visual */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <div className="aspect-4/3">
                <img
                  src={heroImage}
                  alt="Crowd at a live music festival under laser lights"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* gradient so overlay text stays legible */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-xs font-medium text-violet-200 bg-violet-500/25 border border-violet-300/30 backdrop-blur px-3 py-1 rounded-full">
                  Upcoming highlight
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white text-xl font-semibold">
                  Neon Beat Fest
                </h3>
                <p className="text-slate-300 text-sm mt-1">
                  Aug 14–16 · Soldier Field, Chicago
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full">
            GUARANTEED SECURE
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-white">
            Your Path to the Front Row
          </h2>
          <p className="mt-4 text-slate-400">
            Eventify simplifies live experiences. Book with confidence in
            minutes using our certified process.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              icon: "🔍",
              title: "Browse & Discover",
              description:
                "Use advanced filtering to pinpoint exactly what live experiences you want to catch near you.",
            },
            {
              step: "02",
              icon: "🎫",
              title: "Pick Your Tickets",
              description:
                "Choose the ticket type and quantity that fits your budget and plans.",
            },
            {
              step: "03",
              icon: "🌐",
              title: "Checkout Safely",
              description:
                "Complete your purchase with encrypted, trusted payment partners in seconds.",
            },
            {
              step: "04",
              icon: "🎟️",
              title: "Access E-Ticket",
              description:
                "Receive it instantly via email. Just present the secure code at the door.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-[#12121e] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-violet-500/15 text-lg">
                  {item.icon}
                </span>
                <span className="text-2xl font-semibold text-slate-700">
                  {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-medium text-white text-sm">Filters</h3>
                {hasActiveFilter && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Location filter */}
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Location
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    📍
                  </span>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Bandung, Jakarta"
                    className="w-full pl-8 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-400/60"
                  />
                  {locationInput && (
                    <button
                      onClick={() => setLocationInput("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Type filter */}
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 mb-2">
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
                            ? "bg-violet-500/15 text-violet-300 font-medium"
                            : "text-slate-400 hover:bg-white/5"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Category
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam("categoryId", undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        !categoryId
                          ? "bg-violet-500/15 text-violet-300 font-medium"
                          : "text-slate-400 hover:bg-white/5"
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
                            ? "bg-violet-500/15 text-violet-300 font-medium"
                            : "text-slate-400 hover:bg-white/5"
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
                  <span className="text-xs bg-violet-500/15 text-violet-300 px-3 py-1 rounded-full flex items-center gap-1 border border-violet-400/20">
                    Search: "{debouncedSearch}"
                    <button
                      onClick={() => setSearchInput("")}
                      className="hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {debouncedLocation && (
                  <span className="text-xs bg-violet-500/15 text-violet-300 px-3 py-1 rounded-full flex items-center gap-1 border border-violet-400/20">
                    📍 {debouncedLocation}
                    <button
                      onClick={() => setLocationInput("")}
                      className="hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {type && (
                  <span className="text-xs bg-violet-500/15 text-violet-300 px-3 py-1 rounded-full flex items-center gap-1 border border-violet-400/20">
                    {type === "free" ? "Free" : "Paid"}
                    <button
                      onClick={() => updateParam("type", undefined)}
                      className="hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {categoryId && categories && (
                  <span className="text-xs bg-violet-500/15 text-violet-300 px-3 py-1 rounded-full flex items-center gap-1 border border-violet-400/20">
                    {categories.find((c) => c.id === categoryId)?.name}
                    <button
                      onClick={() => updateParam("categoryId", undefined)}
                      className="hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Result info */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
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
                      className="text-sm text-violet-300 border border-violet-400/30 px-4 py-2 rounded-lg hover:bg-violet-500/10"
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
      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Backed by Real Experience
          </h2>
          <p className="mt-4 text-slate-400">
            See what event-goers and organizers say about our secure booking
            process.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            {
              quote:
                "Smoothest booking I've had. Got my tickets in a few taps and the scan at the gate was instant.",
              name: "Marcus Sterling",
              role: "Festival Goer",
              initials: "MS",
              color: "bg-orange-500/20 text-orange-300",
            },
            {
              quote:
                "Filtering by location and category made finding a show near me way faster than other apps.",
              name: "Clara Montgomery",
              role: "Theater Enthusiast",
              initials: "CM",
              color: "bg-rose-500/20 text-rose-300",
            },
            {
              quote:
                "No hidden checkout fees. What you see is what you pay. Refreshing for a ticketing platform.",
              name: "David Chen",
              role: "Sports Season Ticket Holder",
              initials: "DC",
              color: "bg-sky-500/20 text-sky-300",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-[#12121e] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex gap-1 text-amber-400 text-sm mb-4">
                {"★★★★★"}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-semibold shrink-0 ${t.color}`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}