import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { PlannerProfile } from '../../models/planner-profile.model';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-planner-profile',
  templateUrl: './planner-profile.component.html',
  styleUrls: ['./planner-profile.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class PlannerProfileComponent implements OnInit {

  plannerId!: number;
  profile: PlannerProfile | null = null;
  events: Event[] = [];

  showRequestForm = false;
  requestForm!: FormGroup;

  eventTypes: string[] = [
    'Birthday','Wedding','Corporate','Concerts','Social Gatherings',
    'Cultural','Sports','Webinars','Fundraisers','Others'
  ];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.plannerId = Number(this.route.snapshot.paramMap.get('plannerId'));

    this.requestForm = this.fb.group({
      eventTypePreset: ['', Validators.required],
      customEventType: [''],
      preferredDate: [''],     // datetime-local string
      location: [''],
      description: ['', Validators.required]
    });

    this.requestForm.get('eventTypePreset')?.valueChanges.subscribe((val: string) => {
      const c = this.requestForm.get('customEventType');
      if (!c) return;

      if (val === 'Others') c.setValidators([Validators.required]);
      else { c.clearValidators(); c.setValue(''); }

      c.updateValueAndValidity();
    });

    this.load();
  }

  load(): void {
    this.clientService.getPlannerProfile(this.plannerId).subscribe(p => this.profile = p);
    this.clientService.getPlannerEvents(this.plannerId).subscribe(e => this.events = e);
  }

  toggleRequestForm(): void {
    this.showRequestForm = !this.showRequestForm;
  }

  submitRequest(): void {
    if (this.requestForm.invalid) return;

    const preset = this.requestForm.value.eventTypePreset;
    const custom = this.requestForm.value.customEventType;
    const eventType = preset === 'Others' ? custom : preset;

    const payload = {
      clientId: Number(localStorage.getItem('user_id')),
      clientName: localStorage.getItem('username') || 'Client',
      eventType,
      preferredDate: this.requestForm.value.preferredDate,
      location: this.requestForm.value.location,
      description: this.requestForm.value.description
    };

    this.clientService.createRequest(this.plannerId, payload).subscribe(() => {
      alert('Request sent successfully!');
      this.requestForm.reset();
      this.showRequestForm = false;
    });
  }
}