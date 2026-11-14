"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { appointmentApi } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useLoad } from "@/lib/use-load";
import { AppointmentForm } from "../../../components/AppointmentForm";
import { EmptyState, LoadingRows } from "../../../components/ui/EmptyState";
import { PageHeader } from "../../../components/ui/PageHeader";

export default function EditAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const showToast = useToast();
  const { data: appointment, error, loading } = useLoad(useCallback(() => appointmentApi.getById(id), [id]));
  const back = { href: `/appointments/${id}`, label: "Appointment" };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Edit appointment" back={back} />
      {loading ? (
        <LoadingRows rows={3} />
      ) : error || !appointment ? (
        <EmptyState title="Couldn't load this appointment" body={error ?? "Please try again."} />
      ) : (
        <AppointmentForm
          initial={appointment}
          submitLabel="Save changes"
          onSubmit={async (request) => {
            await appointmentApi.update(id, request);
            showToast("Changes saved");
            router.push(back.href);
          }}
        />
      )}
    </div>
  );
}
