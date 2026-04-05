export interface Payment {
  id: number;
  eventId: number;
  clientId: number;

  amount: number; // rupees
  status: 'CREATED' | 'QR_CREATED' | 'SUCCESS' | 'FAILED';

  provider: string;

  razorpayQrId?: string;
  razorpayQrImageUrl?: string;
  razorpayPaymentId?: string;
}