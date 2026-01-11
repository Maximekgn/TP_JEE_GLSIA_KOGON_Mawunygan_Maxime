import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let component: LandingPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a main landmark', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('main')).toBeTruthy();
  });

  it('should have a login CTA link to /login', () => {
    const el: HTMLElement = fixture.nativeElement;

    const anchors = Array.from(el.querySelectorAll('a')) as HTMLAnchorElement[];
    const hasLoginHref = anchors.some((a) => (a.getAttribute('href') ?? '').includes('/login'));

    // RouterLink renders an href in tests when using provideRouter.
    // If this ever changes (e.g. using button + Router.navigate), update this assertion accordingly.
    expect(hasLoginHref).toBe(true);
  });
});
