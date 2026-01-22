'use client';
import { useSearchParams } from 'next/navigation';

export function usePayment() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return { bookingId };
}
