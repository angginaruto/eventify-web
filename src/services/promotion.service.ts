// src/services/promotion.service.ts
import api from "@/lib/axios";

export interface Promotion {
  // tipe data untuk promotion yang dikembalikan dari API
  id: string;
  eventId: string;
  type: "DATE_BASED" | "REFERRAL";
  code: string | null;
  discountValue: number;
  quota: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CreatePromotionPayload {
  // tipe data untuk payload saat membuat promotion baru
  type: "DATE_BASED" | "REFERRAL";
  discountValue: number;
  code?: string;
  quota?: number;
  startDate?: string;
  endDate?: string;
}

export async function getEventPromotionsApi( // ambil daftar promotion untuk suatu event
  eventId: string,
): Promise<Promotion[]> {
  const res = await api.get(`/events/${eventId}/promotions`);
  return res.data.data;
}

export async function createPromotionApi( // buat promotion baru untuk suatu event
  eventId: string,
  payload: CreatePromotionPayload,
): Promise<Promotion> {
  const res = await api.post(`/events/${eventId}/promotions`, payload);
  return res.data.data;
}

export async function deletePromotionApi( // hapus promotion dari suatu event
  eventId: string,
  promotionId: string,
): Promise<void> {
  await api.delete(`/events/${eventId}/promotions/${promotionId}`);
}
