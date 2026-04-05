import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { EventRequest } from '../../models/event-request.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-requests',
  templateUrl: './client-requests.component.html',
  styleUrls: ['./client-requests.component.css']
})
export class ClientRequestsComponent implements OnInit {

  requests: EventRequest[] = [];
  clientId!: number;

  constructor(private clientService: ClientService, private router: Router) {}

  ngOnInit(): void {
    this.clientId = Number(localStorage.getItem('user_id'));
    this.load();
  }

  load(): void {
    this.clientService.getMyRequests(this.clientId).subscribe(r => this.requests = r);
  }

  back(): void {
    this.router.navigate(['/client-dashboard']);
  }

  acceptBudget(requestId: number) {
  this.clientService.acceptBudget(requestId, this.clientId).subscribe(() => this.load());
}

rejectBudget(requestId: number) {
  this.clientService.rejectBudget(requestId, this.clientId).subscribe(() => this.load());
}
}