"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { appointmentSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { toast } from "@/hooks/use-toast";

const bookingFormSchema = appointmentSchema.omit({ startTime: true }).extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});
type BookingFormInput = z.infer<typeof bookingFormSchema>;

export interface BookingCustomer {
  id: string;
  name: string;
}

export interface BookingService {
  id: string;
  name: string;
  duration: number;
}

export interface BookingStaffOption {
  id: string;
  name: string;
}

export interface BookingLocationOption {
  id: string;
  name: string;
}

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: BookingCustomer[];
  services: BookingService[];
  staff: BookingStaffOption[];
  locations: BookingLocationOption[];
}

export function BookingFormDialog({
  open,
  onOpenChange,
  customers,
  services,
  staff,
  locations,
}: BookingFormDialogProps) {
  const router = useRouter();
  // customerId/serviceId are required by the API; staff/location are optional
  // (an appointment can be created unassigned), so only these two block creation.
  const canCreate = customers.length > 0 && services.length > 0;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        customerId: "",
        serviceId: "",
        staffId: "",
        locationId: "",
        date: new Date().toISOString().slice(0, 10),
        time: "",
        notes: "",
      });
    }
  }, [open, reset]);

  const customerId = watch("customerId");
  const serviceId = watch("serviceId");
  const staffId = watch("staffId");
  const locationId = watch("locationId");
  const selectedService = services.find((s) => s.id === serviceId);

  async function onSubmit(data: BookingFormInput) {
    const startTime = new Date(`${data.date}T${data.time}`);
    if (Number.isNaN(startTime.getTime())) {
      toast({ variant: "destructive", title: "That date and time aren't valid" });
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: data.customerId,
        serviceId: data.serviceId,
        staffId: data.staffId || undefined,
        locationId: data.locationId || undefined,
        startTime: startTime.toISOString(),
        notes: data.notes,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Couldn't create booking",
        description:
          typeof json.error === "string" ? json.error : "Please check the form and try again.",
      });
      return;
    }

    toast({ variant: "success", title: "Booking created" });
    onOpenChange(false);
    router.refresh();
  }

  if (!canCreate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
            <DialogDescription>
              You need at least one customer and one service before you can create a booking.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <span className={customers.length > 0 ? "text-gray-400 line-through" : "text-gray-900"}>
                Add a customer
              </span>
              {customers.length === 0 && (
                <Link href="/customers" className="text-brand-600 hover:underline font-medium">
                  Go to Customers
                </Link>
              )}
            </li>
            <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <span className={services.length > 0 ? "text-gray-400 line-through" : "text-gray-900"}>
                Add a service
              </span>
              {services.length === 0 && (
                <Link href="/services" className="text-brand-600 hover:underline font-medium">
                  Go to Services
                </Link>
              )}
            </li>
          </ul>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Booking"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Create booking"
    >
      <div className="space-y-1.5">
        <Label htmlFor="booking-customer">Customer</Label>
        <Select value={customerId || undefined} onValueChange={(val) => setValue("customerId", val)}>
          <SelectTrigger id="booking-customer">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <p className="text-xs text-red-600">{errors.customerId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="booking-service">Service</Label>
        <Select value={serviceId || undefined} onValueChange={(val) => setValue("serviceId", val)}>
          <SelectTrigger id="booking-service">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} · {s.duration} min
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceId && <p className="text-xs text-red-600">{errors.serviceId.message}</p>}
        {selectedService && (
          <p className="text-xs text-gray-500">Duration: {selectedService.duration} minutes</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-date">Date</Label>
          <Input id="booking-date" type="date" error={errors.date?.message} {...register("date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-time">Time</Label>
          <Input id="booking-time" type="time" error={errors.time?.message} {...register("time")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="booking-staff">Staff</Label>
        {staff.length > 0 ? (
          <Select value={staffId || undefined} onValueChange={(val) => setValue("staffId", val)}>
            <SelectTrigger id="booking-staff">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-gray-500">
            No staff yet — this booking will be unassigned.{" "}
            <Link href="/staff" className="text-brand-600 hover:underline">
              Add staff
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="booking-location">Location</Label>
        {locations.length > 0 ? (
          <Select value={locationId || undefined} onValueChange={(val) => setValue("locationId", val)}>
            <SelectTrigger id="booking-location">
              <SelectValue placeholder="No location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-gray-500">
            No locations yet.{" "}
            <Link href="/locations" className="text-brand-600 hover:underline">
              Add a location
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="booking-notes">Notes</Label>
        <Textarea id="booking-notes" error={errors.notes?.message} {...register("notes")} />
      </div>

      <p className="text-xs text-gray-500">
        New bookings are created as <span className="font-medium text-gray-700">Confirmed</span>.
        You can change the status anytime from the table.
      </p>
    </EntityFormDialog>
  );
}
