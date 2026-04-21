// src/pages/organizer/CreateEventPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import EventForm, { type EventFormData } from "@/components/EventForm";
import { createEventApi } from "@/services/event.service";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: EventFormData) {
    setIsSubmitting(true);
    setError("");
    try {
      await createEventApi({
        ...data,
        imageUrl: data.imageUrl || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      navigate("/organizer/events");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create event";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below. Event will be saved as Draft first.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Event"
          error={error}
        />
      </div>
    </div>
  );
}
