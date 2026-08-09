import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function HomePage() {
  return (
    <main className="landing-main">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <strong>VIP Maths</strong>
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-link">Login</Link>
          <Link href="/register">
            <Button variant="primary">Start Free Trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Question Paper <span className="text-highlight">Software</span><br />
            Create Question Papers in <span className="text-highlight">Minutes</span>
          </h1>
          <p className="hero-subtitle">
            Powerful question paper generator for schools and teachers. Instantly create exams using a smart question bank with blueprint & marks distribution.
          </p>
          <div className="hero-actions">
            <Link href="/register">
              <Button variant="primary" size="lg" className="btn-vibrant">🚀 Start Free Trial</Button>
            </Link>
            <Button variant="secondary" size="lg" className="btn-glass">Help Videos ▶</Button>
          </div>
          
          <div className="hero-links">
            <a href="#" className="hero-link">Sample Question Papers for State Board →</a>
            <a href="#" className="hero-link">Sample Question Papers for CBSE board →</a>
          </div>
          
          <div className="hero-stats">
            <span>✔ 5+ Lakh Questions & Answers</span>
            <span>✔ Classes 6–12</span>
            <span>✔ Unlimited Question Paper Generation</span>
          </div>
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <h2 className="trusted-title">Some of our Schools, Academics, Tuitions and Coaching Center Customers.</h2>
        <div className="trusted-grid">
          <div className="trusted-logo">Jain Matric</div>
          <div className="trusted-logo">Chordia Public</div>
          <div className="trusted-logo">Akshara Tuition</div>
          <div className="trusted-logo">Gurukulam</div>
          <div className="trusted-logo">Ambition Coaching</div>
        </div>
      </section>
    </main>
  );
}
