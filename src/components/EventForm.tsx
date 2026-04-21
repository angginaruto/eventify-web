// src/components/EventForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesApi } from "@/services/event.service";

const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    categoryId: z.string().uuid("Please select a category"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    location: z.string().min(3, "Location is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    price: z.coerce.number().int().min(0, "Price cannot be negative"),
    availableSeats: z.coerce.number().int().min(1, "Must have at least 1 seat"),
    imageUrl: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  error?: string;
}

export default function EventForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  error,
}: EventFormProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesApi,
    staleTime: Infinity,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { price: 0, ...defaultValues },
  });

  useEffect(() => {
    if (defaultValues) reset({ price: 0, ...defaultValues });
  }, [defaultValues, reset]);

  const price = watch("price");
  const isFree = price === 0 || price === undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Event Title
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="e.g. Bandung Music Festival 2025"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
            ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Category
        </label>
        <select
          {...register("categoryId")}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors bg-white
            ${errors.categoryId ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
        >
          <option value="">Select a category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-xs mt-1">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe your event..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none
            ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Location
        </label>
        <input
          {...register("location")}
          type="text"
          placeholder="e.g. Jakarta Convention Center, Jakarta"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
            ${errors.location ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
        />
        {errors.location && (
          <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Start Date & Time
          </label>
          <input
            {...register("startDate")}
            type="datetime-local"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
              ${errors.startDate ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            End Date & Time
          </label>
          <input
            {...register("endDate")}
            type="datetime-local"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
              ${errors.endDate ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Price & Seats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ticket Price (IDR)
            <span className="text-gray-400 font-normal ml-1">(0 = Free)</span>
          </label>
          <input
            {...register("price")}
            type="number"
            min={0}
            placeholder="0"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
              ${errors.price ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
          />
          {isFree && (
            <p className="text-green-600 text-xs mt-1">
              ✓ This will be a free event
            </p>
          )}
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Available Seats
          </label>
          <input
            {...register("availableSeats")}
            type="number"
            min={1}
            placeholder="100"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
              ${errors.availableSeats ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
          />
          {errors.availableSeats && (
            <p className="text-red-500 text-xs mt-1">
              {errors.availableSeats.message}
            </p>
          )}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Image URL{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register("imageUrl")}
          type="url"
          placeholder="https://example.com/image.jpg"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
            ${errors.imageUrl ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
        />
        {errors.imageUrl && (
          <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
          text-white font-medium rounded-xl text-sm transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
