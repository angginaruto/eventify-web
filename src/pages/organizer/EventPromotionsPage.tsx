// src/pages/organizer/EventPromotionsPage.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getEventPromotionsApi,
  createPromotionApi,
  deletePromotionApi,
} from "@/services/promotion.service";
import api from "@/lib/axios";
import ConfirmDialog from "@/components/ConfirmDialog";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// schemas
const dateBasedSchema = z // form untuk promosi berbasis tanggal
  .object({
    discountValue: z.coerce
      .number()
      .int()
      .min(1000, "Minimum discount Rp 1.000"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

const referralSchema = z.object({
  discountValue: z.coerce.number().int().min(1000, "Minimum discount Rp 1.000"),
  code: z
    .string()
    .min(3, "Min 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers"),
  quota: z.coerce.number().int().min(1, "Minimum quota 1"),
});

type DateBasedForm = z.infer<typeof dateBasedSchema>;
type ReferralForm = z.infer<typeof referralSchema>;

async function getEventDetailApi(eventId: string) {
  const res = await api.get(`/events/${eventId}`);
  return res.data.data;
}

export default function EventPromotionsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<"DATE_BASED" | "REFERRAL">(
    "DATE_BASED",
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventDetailApi(id!),
    enabled: !!id,
  });

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["event-promotions", id],
    queryFn: () => getEventPromotionsApi(id!),
    enabled: !!id,
  });

  // date based form
  const dateForm = useForm<DateBasedForm>({
    resolver: zodResolver(dateBasedSchema),
  });

  // referral form
  const referralForm = useForm<ReferralForm>({
    resolver: zodResolver(referralSchema),
  });

  const createMutation = useMutation({
    // mutation untuk membuat promosi baru
    mutationFn: (payload: any) => createPromotionApi(id!, payload), // kirim ke backend
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-promotions", id] });
      dateForm.reset();
      referralForm.reset();
      setFormError("");
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message || "Failed to create promotion",
      );
    },
  });

  const deleteMutation = useMutation({
    // mutation untuk menghapus promosi
    mutationFn: (promotionId: string) => deletePromotionApi(id!, promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-promotions", id] });
      setDeleteId(null);
    },
  });

  function handleDateBasedSubmit(data: DateBasedForm) {
    // submit handler untuk form promosi berbasis tanggal
    setFormError("");
    createMutation.mutate({
      type: "DATE_BASED",
      discountValue: data.discountValue,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }

  function handleReferralSubmit(data: ReferralForm) {
    // submit handler untuk form voucher referal
    setFormError("");
    createMutation.mutate({
      type: "REFERRAL",
      discountValue: data.discountValue,
      code: data.code,
      quota: data.quota,
    });
  }

  const dateBasedPromos =
    promotions?.filter((p) => p.type === "DATE_BASED") ?? [];
  const referralPromos = promotions?.filter((p) => p.type === "REFERRAL") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/organizer/events"
          className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
        >
          ← Back to My Events
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
        {event && (
          <p className="text-sm text-gray-500 mt-1 truncate">{event.title}</p>
        )}
      </div>

      {/* Guard — hanya event PUBLISHED yang bisa buat promosi */}
      {event && event.status !== "PUBLISHED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Promotions are only available for published events
            </p>
            <p className="text-xs text-amber-600 mt-1">
              This event is currently <strong>{event.status}</strong>.
              {event.status === "DRAFT" &&
                " Publish the event first to create promotions."}
            </p>
            {event.status === "DRAFT" && (
              <Link
                to="/organizer/events"
                className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
              >
                Go to My Events to publish →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form buat promosi — hanya tampil kalau PUBLISHED */}
        {event?.status === "PUBLISHED" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Create Promotion
            </h2>

            {/* Type toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              <button
                onClick={() => {
                  setActiveType("DATE_BASED");
                  setFormError("");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  activeType === "DATE_BASED"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📅 Date-based
              </button>
              <button
                onClick={() => {
                  setActiveType("REFERRAL");
                  setFormError("");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  activeType === "REFERRAL"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🎟️ Voucher
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {formError}
              </div>
            )}

            {/* Date-based form */}
            {activeType === "DATE_BASED" && (
              <form
                onSubmit={dateForm.handleSubmit(handleDateBasedSubmit)}
                className="space-y-4"
              >
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Diskon otomatis untuk semua pembeli dalam rentang tanggal ini.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Amount (IDR)
                  </label>
                  <input
                    {...dateForm.register("discountValue")}
                    type="number"
                    placeholder="e.g. 50000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                    ${dateForm.formState.errors.discountValue ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                  />
                  {dateForm.formState.errors.discountValue && (
                    <p className="text-red-500 text-xs mt-1">
                      {dateForm.formState.errors.discountValue.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      {...dateForm.register("startDate")}
                      type="date"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                      ${dateForm.formState.errors.startDate ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                    />
                    {dateForm.formState.errors.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {dateForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      End Date
                    </label>
                    <input
                      {...dateForm.register("endDate")}
                      type="date"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                      ${dateForm.formState.errors.endDate ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                    />
                    {dateForm.formState.errors.endDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {dateForm.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create Date-based Discount"}
                </button>
              </form>
            )}

            {/* Referral voucher form */}
            {activeType === "REFERRAL" && (
              <form
                onSubmit={referralForm.handleSubmit(handleReferralSubmit)}
                className="space-y-4"
              >
                <p className="text-xs text-gray-500 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  Kode voucher dengan quota terbatas. Pembeli input kode ini
                  saat checkout.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Voucher Code
                  </label>
                  <input
                    {...referralForm.register("code")}
                    type="text"
                    placeholder="e.g. EARLYBIRD50K"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors uppercase
                    ${referralForm.formState.errors.code ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                    onChange={(e) =>
                      referralForm.setValue(
                        "code",
                        e.target.value.toUpperCase(),
                      )
                    }
                  />
                  {referralForm.formState.errors.code && (
                    <p className="text-red-500 text-xs mt-1">
                      {referralForm.formState.errors.code.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Uppercase letters and numbers only
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Amount (IDR)
                    </label>
                    <input
                      {...referralForm.register("discountValue")}
                      type="number"
                      placeholder="e.g. 25000"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                      ${referralForm.formState.errors.discountValue ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                    />
                    {referralForm.formState.errors.discountValue && (
                      <p className="text-red-500 text-xs mt-1">
                        {referralForm.formState.errors.discountValue.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quota
                    </label>
                    <input
                      {...referralForm.register("quota")}
                      type="number"
                      placeholder="e.g. 50"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                      ${referralForm.formState.errors.quota ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
                    />
                    {referralForm.formState.errors.quota && (
                      <p className="text-red-500 text-xs mt-1">
                        {referralForm.formState.errors.quota.message}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {createMutation.isPending ? "Creating..." : "Create Voucher"}
                </button>
              </form>
            )}
          </div>
        )}{" "}
        {/* end event?.status === "PUBLISHED" */}
        {/* List promosi aktif */}
        <div className="space-y-4">
          {/* Date-based promos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📅 Date-based Discounts
              <span className="text-xs font-normal text-gray-400">
                ({dateBasedPromos.length})
              </span>
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : dateBasedPromos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No date-based discounts yet
              </p>
            ) : (
              <div className="space-y-2">
                {dateBasedPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-amber-700">
                        − {formatIDR(promo.discountValue)}
                      </p>
                      <p className="text-xs text-amber-600">
                        {format(new Date(promo.startDate!), "dd MMM yyyy")} —{" "}
                        {format(new Date(promo.endDate!), "dd MMM yyyy")}
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteId(promo.id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral vouchers */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🎟️ Vouchers
              <span className="text-xs font-normal text-gray-400">
                ({referralPromos.length})
              </span>
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : referralPromos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No vouchers yet
              </p>
            ) : (
              <div className="space-y-2">
                {referralPromos.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-indigo-700 tracking-widest">
                        {promo.code}
                      </p>
                      <p className="text-xs text-indigo-600">
                        − {formatIDR(promo.discountValue)}
                      </p>
                      <p className="text-xs text-indigo-400">
                        {promo.usedCount}/{promo.quota} used
                      </p>
                    </div>
                    <button
                      onClick={() => setDeleteId(promo.id)}
                      disabled={promo.usedCount > 0}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
