"use client";

import { useRouter } from "next/navigation";
import { appointmentApi } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { AppointmentForm } from "../../components/AppointmentForm";
import { PageHeader } from "../../components/ui/PageHeader";

export default function NewAppointmentPage() {
  const router = useRouter();
  const showToast = useToast();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Book appointment" />
      <AppointmentForm
        submitLabel="Book appointment"
        onSubmit={async (request) => {
          const id = await appointmentApi.create(request);
          showToast("Appointment booked");
          router.push(`/appointments/${id}`);
        }}
      />
    </div>
  );
}
