"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_URL } from "@/app/lib/api";

export interface BookingFormState {
  name: string;
  phone: string;
  clinic?: string;
  service?: string;
  gender?: string;
  age?: string;
  symptoms?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  email?: string;
  dob?: string;
  consent?: boolean;
}

export function useBookingForm() {
  const router = useRouter();

  const [form, setForm] = useState<BookingFormState>({
    name: "",
    phone: "",
    gender: "",
    age: "",
    symptoms: "",
    clinic: "",
    service: "",
    appointmentDate: "",
    appointmentTime: "",
    email: "",
    dob: "",
    consent: false,
  });

  const [errors, setErrors] = useState<Partial<BookingFormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof BookingFormState>(
    key: K,
    value: BookingFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function getValidationErrors(): Partial<BookingFormState> {
    const e: Partial<BookingFormState> = {};

    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";

    if (!form.phone.trim()) {
      e.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (!form.gender) e.gender = "Chọn giới tính";

    if (!form.age || Number(form.age) <= 0) {
      e.age = "Vui lòng nhập tuổi hợp lệ";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email không hợp lệ";
    }

    if (!form.clinic) e.clinic = "Chọn phòng khám";
    if (!form.service) e.service = "Chọn dịch vụ";

    if (form.clinic && form.service) {
      if (!form.appointmentDate) e.appointmentDate = "Chọn ngày";
      if (!form.appointmentTime) e.appointmentTime = "Chọn giờ";
    }
    if (!form.consent) e.consent = true;

    return e;
  }

  function validateForm(): boolean {
    const e = getValidationErrors();
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function validateBookingAvailability(): Promise<boolean> {
    const e = getValidationErrors();

    // Check phone format first
    const isPhoneValidFormat = !(e as any).phone;

    if (isPhoneValidFormat && form.appointmentDate) {
      setIsSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/bookings/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: form.phone,
            appointmentDate: form.appointmentDate,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 400 && errorData.error) {
            e.phone = errorData.error;
          } else {
            throw new Error(errorData.error || "Validation failed");
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const booking_time = `${form.appointmentDate}T${form.appointmentTime}:00`;

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          gender: form.gender,
          age: Number(form.age),
          symptoms: form.symptoms,
          clinic: form.clinic,
          service: form.service,
          booking_time,
          amount: 2000,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Check if it's our specific duplicate booking error
        if (res.status === 400 && errorData.error?.includes("Số điện thoại")) {
          setErrors((prev) => ({ ...prev, phone: errorData.error }));
          // Start timer to clear error after 5 seconds
          setTimeout(() => {
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }, 5000);
          return; // Stop execution, don't throw
        }
        throw new Error(errorData.error || "Booking failed");
      }

      const data: { bookingId: string } = await res.json();
      return data.bookingId;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setForm({
      name: "",
      phone: "",
      gender: "",
      age: "",
      symptoms: "",
      clinic: "",
      service: "",
      appointmentDate: "",
      appointmentTime: "",
      email: "",
      dob: "",
      consent: false,
    });
    setErrors({});
  }

  return {
    form,
    update,
    submit,
    errors,
    isSubmitting,
    validateForm,
    validateBookingAvailability,
    reset,
  };
}
