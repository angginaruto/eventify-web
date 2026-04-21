// src/services/transaction.service.ts
import api from "@/lib/axios";

export interface CreateTransactionPayload {
  eventId: string;
  quantity: number;
  couponCode?: string;
  usePoints: boolean;
}

export interface Transaction {
  id: string;
  eventId: string;
  quantity: number;
  basePrice: number;
  discountAmount: number;
  pointsUsed: number;
  finalPrice: number;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
    imageUrl: string | null;
    isFree: boolean;
  };
  coupon: { code: string; discount: number } | null;
}

export interface PointsResponse {
  totalActive: number;
  points: {
    id: string;
    amount: number;
    expiresAt: string;
    status: string;
  }[];
}

export interface CouponResponse {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
}

export async function createTransactionApi(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const res = await api.post("/transactions", payload);
  return res.data.data;
}

export async function getMyTransactionsApi(): Promise<Transaction[]> {
  const res = await api.get("/transactions/my");
  return res.data.data;
}

export async function getMyPointsApi(): Promise<PointsResponse> {
  const res = await api.get("/transactions/points/me");
  return res.data.data;
}

export async function getMyCouponsApi(): Promise<CouponResponse[]> {
  const res = await api.get("/transactions/coupons/me");
  return res.data.data;
}
