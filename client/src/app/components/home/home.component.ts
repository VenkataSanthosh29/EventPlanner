import {
  Component,
  HostListener,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('bgVideo') videoElement!: ElementRef<HTMLVideoElement>;

  isScrolled = false;
  private intervalId: any;

  //  Updated nav links to include Roles
  navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Roles', href: '#roles' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ];

  //  More “platform” tone
  eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Concert', 'Conference', 'Reception'];
  currentEventIndex = 0;

  get currentEvent(): string {
    return this.eventTypes[this.currentEventIndex];
  }

  // Your existing mock data (unchanged)
  mockData = {
    quickServices: [
      {
        title: 'Venue Selection',
        icon: 'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/confetti-icon.webp',
        description: 'Explore venues, compare options, and lock the best fit for your event.'
      },
      {
        title: 'Decoration',
        icon: 'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/garlands-icon.webp',
        description: 'Coordinate themes, vendors, and checklists with your team.'
      },
      {
        title: 'Entertainment',
        icon: 'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/guitar-pink-icon.webp',
        description: 'Plan programs, schedules, and staff assignments in one place.'
      }
    ],

    testimonials: [
      {
        name: 'Sarah Jenkins',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        feedback: 'Evenizer made coordination effortless. Clear tasks and smooth workflow!'
      },
      {
        name: 'Marcus Thorne',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        feedback: 'Loved how clients, staff, and planners collaborate in one system.'
      },
      {
        name: 'Elena Rodriguez',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        feedback: 'From request to completion — everything tracked perfectly.'
      }
    ],

    clientLogos: [
      'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/carousel-logo.webp',
      'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/mark-focus-logo.webp',
      'https://fse.jegtheme.com/evenizer/wp-content/uploads/sites/81/2025/03/mary-jane-logo.webp'
    ]
  };

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentEventIndex =
        (this.currentEventIndex + 1) % this.eventTypes.length;
    }, 2500);
  }

  ngAfterViewInit(): void {

    // ================= VIDEO =================
    const video = this.videoElement?.nativeElement;

    if (video) {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;

      setTimeout(() => {
        video.play().catch(err => console.log(err));
      }, 500);
    }

    // ================= SERVICE CARDS =================
    const cards = document.querySelectorAll('.service-box');

    cards.forEach((card: any) => {

      const mouseMoveHandler = (e: MouseEvent) => {

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -(y - centerY) / 15;
        const rotateY = (x - centerX) / 15;

        card.style.transform =
          `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(15px)`;
      };

      const leaveHandler = () => {
        card.style.transform = 'rotateX(0) rotateY(0) translateX(0)';
      };

      card.addEventListener('mousemove', mouseMoveHandler);
      card.addEventListener('mouseleave', leaveHandler);

      card._moveHandler = mouseMoveHandler;
      card._leaveHandler = leaveHandler;
    });

    // ================= SCROLL ANIMATION =================
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.scroll-animate').forEach(el => {
      observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);

    const cards = document.querySelectorAll('.service-box');
    cards.forEach((card: any) => {
      card.removeEventListener('mousemove', card._moveHandler);
      card.removeEventListener('mouseleave', card._leaveHandler);
    });
  }
}