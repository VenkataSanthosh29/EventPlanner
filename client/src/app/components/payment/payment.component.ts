import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {

  paymentId!: number;
  clientId!: number;

  payment: Payment | null = null;
  loading = false;
  error: string | null = null;

  // ✅ DEMO MODE (static QR + mark paid)
  demoMode = true;

  private timer: any;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = Number(localStorage.getItem('user_id'));
    this.paymentId = Number(this.route.snapshot.paramMap.get('paymentId'));

    // ✅ Always fetch payment details first
    this.loadPayment();

    // ❌ DO NOT auto-create Razorpay QR (it fails due to UPI not enabled)
    // If you want, user can click a button to try Razorpay QR manually.
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  loadPayment(): void {
    this.clientService.getPayment(this.paymentId, this.clientId).subscribe({
      next: (p) => {
        this.payment = p;
        // Start polling only if not already success
        if (p.status !== 'SUCCESS') {
          this.startPolling();
        }
      },
      error: (err) => {
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          err?.message ||
          'Failed to load payment';
      }
    });
  }

  // ✅ Optional: Try Razorpay QR manually (will work only after UPI is enabled)
  tryCreateRazorpayQr(): void {
    this.loading = true;
    this.error = null;

    this.clientService.createRazorpayQr(this.paymentId, this.clientId).subscribe({
      next: (p) => {
        this.payment = p;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const desc = err?.error?.error?.description;
        this.error = desc || err?.message || 'Failed to create Razorpay QR';
      }
    });
  }

  // ✅ DEMO: mark payment success without Razorpay
  markPaidDemo(): void {
    if (!this.payment) return;

    this.loading = true;
    this.error = null;

    this.clientService.markPaymentSuccessDemo(this.payment.id, this.clientId).subscribe({
      next: () => {
        this.loading = false;
        this.payment = { ...this.payment!, status: 'SUCCESS' };
      },
      error: (err) => {
        this.loading = false;
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          err?.message ||
          'Failed to mark payment as success (demo)';
      }
    });
  }

  startPolling(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.clientService.getPayment(this.paymentId, this.clientId).subscribe({
        next: (p) => {
          this.payment = p;
          if (p.status === 'SUCCESS') {
            clearInterval(this.timer);
          }
        },
        error: () => {}
      });
    }, 4000);
  }

  back(): void {
    this.router.navigate(['/client-dashboard']);
  }
}