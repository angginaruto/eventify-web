// src/pages/organizer/EditEventPage.tsx
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import EventForm, { type EventFormData } from "@/components/EventForm";
import { getEventByIdApi, updateEventApi } from "@/services/event.service";

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr);
  // format: YYYY-MM-DDTHH:mm
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventByIdApi(id!),
    enabled: !!id,
  });

  async function handleSubmit(data: EventFormData) {
    setIsSubmitting(true);
    setError("");
    try {
      await updateEventApi(id!, {
        ...data,
        imageUrl: data.imageUrl || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      navigate("/organizer/events");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update event";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Event not found.</p>
        <Link
          to="/organizer/events"
          className="text-indigo-600 text-sm hover:underline mt-2 block"
        >
          ← Back to My Events
        </Link>
      </div>
    );
  }

  const defaultValues: Partial<EventFormData> = {
    title: event.title,
    categoryId: event.category.id,
    description: event.description,
    location: event.location,
    startDate: toDatetimeLocal(event.startDate),
    endDate: toDatetimeLocal(event.endDate),
    price: event.price,
    availableSeats: event.availableSeats,
    imageUrl: event.imageUrl ?? "",
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/organizer/events"
          className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
        >
          ← Back to My Events
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{event.title}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <EventForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          error={error}
        />
      </div>
    </div>
  );
}
