// src/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns"; // format tanggal
import { getEventByIdApi } from "@/services/event.service";
import { getEventPromotionsApi } from "@/services/promotion.service"; // ✅ TAMBAH
import {
  createTransactionApi,
  getMyPointsApi,
  getMyCouponsApi,
} from "@/services/transaction.service";
import ConfirmDialog from "@/components/ConfirmDialog";
import { sendTicketConfirmationEmail } from "@/services/email.service";
import { useAuthStore } from "@/store/auth.store";

// extend window untuk Midtrans Snap
declare global {
  interface Window {
    // tambahkan tipe untuk Midtrans Snap
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

function formatIDR(amount: number): string {
  // format angka ke format Rupiah Indonesia
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [autoDiscount, setAutoDiscount] = useState<number>(0);
  const [usePoints, setUsePoints] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventByIdApi(id!), // fetch data event berdasarkan ID dari URL
    enabled: !!id,
  });

  // ✅ TAMBAH: Fetch event promotions
  const { data: promotions } = useQuery({
    queryKey: ["event-promotions", id],
    queryFn: () => getEventPromotionsApi(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (promotions && promotions.length > 0 && event) {
      const now = new Date();

      const activeDatePromos = promotions.filter((p: any) => {
        if (p.type !== "DATE_BASED") return false;
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return now >= start && now <= end;
      });

      if (activeDatePromos.length > 0) {
        const bestPromo = activeDatePromos.reduce((max, p) =>
          p.discountValue > max.discountValue ? p : max,
        );

        const discountPercent = Math.round(
          (bestPromo.discountValue / event.price) * 100,
        );

        setAutoDiscount(discountPercent); // ✅ PINDAH KE SINI
      } else {
        setAutoDiscount(0);
      }
    }
  }, [promotions, event]);

  console.log("Promotions data:", promotions); // ✅ TAMBAH INI
  const { data: pointsData } = useQuery({
    queryKey: ["my-points"],
    queryFn: getMyPointsApi,
  });

  const { data: coupons } = useQuery({
    queryKey: ["my-coupons"],
    queryFn: getMyCouponsApi,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-white/5 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-white/5 rounded-2xl" />
            <div className="h-48 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a12]">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-500">Event not found.</p>
          <Link
            to="/"
            className="text-violet-400 text-sm hover:text-violet-300 mt-2 block"
          >
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  // ✅ TAMBAH: Filter active promotions
  const now = new Date();
  const activeDatePromos =
    promotions?.filter((p: any) => {
      if (p.type !== "DATE_BASED") return false;
      const start = new Date(p.startDate!);
      const end = new Date(p.endDate!);
      return now >= start && now <= end;
    }) ?? [];

  const activeReferralPromos =
    promotions?.filter((p: any) => {
      if (p.type !== "REFERRAL") return false;
      return (p.usedCount ?? 0) < (p.quota ?? 0);
    }) ?? [];

  // kalkulasi harga
  const basePrice = event.price * quantity;

  // 🎟️ coupon
  const couponDiscount = appliedCoupon
    ? Math.floor((basePrice * appliedCoupon.discount) / 100)
    : 0;

  // 🔥 auto promo
  const autoDiscountAmount = Math.floor((basePrice * autoDiscount) / 100);

  // ✅ total discount
  const totalDiscount = couponDiscount + autoDiscountAmount;

  // 💸 setelah diskon
  const priceAfterDiscount = basePrice - totalDiscount;

  // 🪙 points
  const activePoints = pointsData?.totalActive ?? 0;
  const pointsUsed = usePoints ? Math.min(activePoints, priceAfterDiscount) : 0;

  // ✅ final
  const finalPrice = Math.max(0, priceAfterDiscount - pointsUsed);

  function applyCoupon() {
    setCouponError("");
    const code = couponCode.toUpperCase();

    // cek referral promo
    const foundPromo = promotions?.find(
      (p: any) =>
        p.type === "REFERRAL" &&
        p.code === code &&
        (p.usedCount ?? 0) < (p.quota ?? 0),
    );

    if (!foundPromo) {
      setCouponError("Coupon code not valid");
      return;
    }

    setAppliedCoupon({
      code: foundPromo.code!,
      discount: Math.round((foundPromo.discountValue / event!.price) * 100),
    });

    setCouponCode("");
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setError("");
    try {
      const result: any = await createTransactionApi({
        eventId: id!,
        quantity,
        couponCode: appliedCoupon?.code,
        usePoints,
      });

      setShowConfirm(false);

      // helper kirim email tiket
      function sendEmail() {
        if (!event || !user) return;
        sendTicketConfirmationEmail({
          user_name: user.name,
          email: user.email,
          event_name: event.title,
          event_date: format(
            new Date(event.startDate),
            "EEEE, dd MMMM yyyy HH:mm",
          ),
          event_location: event.location,
          order_id: result.transaction.id,
          quantity,
          total_price: finalPrice === 0 ? "Free" : formatIDR(finalPrice),
          event_link: `${window.location.origin}/events/${id}`,
        });
      }

      // jika free event langsung redirect + kirim email
      if (!result.snapToken) {
        sendEmail();
        navigate("/transactions?success=1");
        return;
      }

      // load Midtrans Snap script jika belum ada
      if (!window.snap) {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute(
          "data-client-key",
          import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
        );
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      // tampilkan Snap popup
      window.snap.pay(result.snapToken, {
        onSuccess: () => {
          sendEmail();
          navigate("/transactions?success=1");
        },
        onPending: () => navigate("/transactions?pending=1"),
        onError: () => setError("Payment failed. Please try again."),
        onClose: () => setIsSubmitting(false),
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Transaction failed";
      setError(message);
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  }

  const seatsLeft = event.availableSeats - event.bookedSeats;

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${id}`}
            className="text-sm text-slate-500 hover:text-violet-300 flex items-center gap-1 mb-4"
          >
            ← Back to event
          </Link>
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Event summary */}
          <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Event
            </h2>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-2xl shrink-0">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  "🎪"
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {event.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  📅 {format(new Date(event.startDate), "dd MMM yyyy, HH:mm")}
                </p>
                <p className="text-xs text-slate-500">📍 {event.location}</p>
              </div>
            </div>
          </div>

          {/* ✅ TAMBAH: Event Promotions Section */}
          {(activeDatePromos.length > 0 ||
            activeReferralPromos.length > 0) && (
            <div className="bg-amber-500/10 rounded-2xl border border-amber-400/20 p-5">
              <p className="text-sm font-semibold text-amber-300 mb-3">
                🎉 Available Promotions
              </p>
              <div className="space-y-2">
                {activeDatePromos.map((promo: any) => (
                  <div key={promo.id} className="text-sm">
                    <p className="font-medium text-amber-200">
                      💰 Discount: {formatIDR(promo.discountValue)}
                    </p>
                    <p className="text-xs text-amber-400/80">
                      Valid until{" "}
                      {format(new Date(promo.endDate), "dd MMM yyyy")}
                    </p>
                  </div>
                ))}
                {activeReferralPromos.map((promo: any) => (
                  <div key={promo.id} className="text-sm">
                    <p className="font-medium text-amber-200">
                      🎟️ Code: <span className="font-bold">{promo.code}</span>
                    </p>
                    <p className="text-xs text-amber-400/80">
                      Save {formatIDR(promo.discountValue)} (
                      {(promo.quota ?? 0) - (promo.usedCount ?? 0)} remaining)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {!event.isFree && (
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Quantity
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 flex items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-white w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(10, q + 1, seatsLeft))
                  }
                  className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 flex items-center justify-center text-lg"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 ml-2">
                  Max {Math.min(10, seatsLeft)} tickets
                </span>
              </div>
            </div>
          )}

          {/* Coupon */}
          {!event.isFree && (
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Coupon
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-300">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-emerald-400/80">
                      {appliedCoupon.discount}% discount applied
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm outline-none focus:border-violet-400/60"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2.5 bg-violet-500 text-white text-sm rounded-xl hover:bg-violet-400 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-xs mt-1">
                      {couponError}
                    </p>
                  )}
                  {coupons && coupons.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">
                        Your available coupons:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {coupons.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCouponCode(c.code);
                              setAppliedCoupon({
                                code: c.code,
                                discount: c.discount,
                              });
                            }}
                            className="text-xs border border-dashed border-violet-400/30 text-violet-300 px-3 py-1.5 rounded-lg hover:bg-violet-500/10"
                          >
                            {c.code} ({c.discount}% off)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Points */}
          {!event.isFree && activePoints > 0 && (
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Points
              </h2>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-white">
                    Use {formatIDR(activePoints)} points
                  </p>
                  <p className="text-xs text-slate-500">
                    Save up to{" "}
                    {formatIDR(Math.min(activePoints, priceAfterDiscount))}
                  </p>
                </div>
                <div
                  onClick={() => setUsePoints((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer
                    ${usePoints ? "bg-violet-500" : "bg-white/10"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                      ${usePoints ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
              </label>
            </div>
          )}

          {/* Price summary */}
          <div className="bg-[#12121e] rounded-2xl border border-white/10 p-5">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Price Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>
                  {event.isFree
                    ? "Free ticket"
                    : `${formatIDR(event.price)} × ${quantity}`}
                </span>
                <span>{event.isFree ? "Free" : formatIDR(basePrice)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon discount ({appliedCoupon?.discount}%)</span>
                  <span>− {formatIDR(couponDiscount)}</span>
                </div>
              )}
              {pointsUsed > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Points redeemed</span>
                  <span>− {formatIDR(pointsUsed)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-white">
                <span>Total</span>
                <span className={finalPrice === 0 ? "text-emerald-400" : ""}>
                  {finalPrice === 0 ? "Free" : formatIDR(finalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="w-full py-4 bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/40 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            {event.isFree
              ? "Get Free Ticket"
              : `Pay ${finalPrice === 0 ? "Free" : formatIDR(finalPrice)}`}
          </button>

          {/* Midtrans badge */}
          {!event.isFree && (
            <p className="text-center text-xs text-slate-500">
              🔒 Secured by Midtrans
            </p>
          )}
        </div>

        {/* Confirm dialog */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Confirm Purchase"
          description={`You're about to ${
            event.isFree
              ? "get a free ticket"
              : `pay ${formatIDR(finalPrice)}`
          } for "${event.title}". Continue?`}
          confirmLabel={event.isFree ? "Get Ticket" : "Proceed to Payment"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}