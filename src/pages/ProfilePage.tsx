// src/pages/ProfilePage.tsx
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";
import {
  getMyPointsApi,
  getMyCouponsApi,
} from "@/services/transaction.service";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ["my-points"],
    queryFn: getMyPointsApi,
    enabled: user?.role === "CUSTOMER",
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery({
    queryKey: ["my-coupons"],
    queryFn: getMyCouponsApi,
    enabled: user?.role === "CUSTOMER",
  });

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your account information
          </p>
        </div>

        <div className="space-y-5">
          {/* User info */}
          <div className="bg-[#12121e] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300 font-bold text-2xl">
                {user?.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {user?.name}
                </h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block border
                  ${
                    user?.role === "ORGANIZER"
                      ? "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/20"
                      : "bg-violet-500/15 text-violet-300 border-violet-400/20"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Referral code */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">
                Your Referral Code
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white tracking-widest">
                  {user?.referralCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referralCode || "");
                  }}
                  className="text-xs text-violet-300 border border-violet-400/30 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                >
                  Copy
                </button>
              </div>
              {user?.role === "CUSTOMER" && (
                <p className="text-xs text-slate-500 mt-2">
                  Share this code to earn 10,000 points for each friend who
                  registers!
                </p>
              )}
              {user?.role === "ORGANIZER" && (
                <p className="text-xs text-slate-500 mt-2">
                  Share this code so others can register with your referral.
                </p>
              )}
            </div>
          </div>

          {/* Points — customer only */}
          {user?.role === "CUSTOMER" && (
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Points Balance
              </h2>

              {pointsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-2 mb-4">
                    <p className="text-3xl font-bold text-violet-300">
                      {formatIDR(pointsData?.totalActive ?? 0)}
                    </p>
                    <p className="text-sm text-slate-500 mb-1">
                      active points
                    </p>
                  </div>

                  {pointsData && pointsData.points.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        Points breakdown:
                      </p>
                      {pointsData.points.map((point) => (
                        <div
                          key={point.id}
                          className="flex items-center justify-between text-sm bg-violet-500/10 border border-violet-400/15 rounded-xl px-4 py-2.5"
                        >
                          <span className="font-medium text-violet-200">
                            {formatIDR(point.amount)}
                          </span>
                          <span className="text-xs text-violet-400/80">
                            Expires{" "}
                            {format(new Date(point.expiresAt), "dd MMM yyyy")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No active points. Share your referral code to earn
                      points!
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Coupons — customer only */}
          {user?.role === "CUSTOMER" && (
            <div className="bg-[#12121e] rounded-2xl border border-white/10 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                My Coupons
              </h2>

              {couponsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-white/5 rounded-xl" />
                  <div className="h-16 bg-white/5 rounded-xl" />
                </div>
              ) : coupons && coupons.length > 0 ? (
                <div className="space-y-3">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-emerald-300 tracking-widest">
                          {coupon.code}
                        </p>
                        <p className="text-xs text-emerald-400 mt-0.5">
                          {coupon.discount}% discount
                        </p>
                        <p className="text-xs text-emerald-500/70 mt-0.5">
                          Expires{" "}
                          {format(new Date(coupon.expiresAt), "dd MMM yyyy")}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(coupon.code)
                        }
                        className="text-xs text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No coupons available. Register using someone's referral
                  code to get a 10% discount coupon!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}