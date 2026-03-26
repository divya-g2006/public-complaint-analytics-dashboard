import { Link } from "react-router-dom";
import "./Home.css";
import PublicNavbar from "../components/PublicNavbar.jsx";
import heroImg from "../assets/hero.png";
import ImageSlider from "../components/ImageSlider.jsx";
import slide1 from "../assets/tn-slide-1.svg";
import slide2 from "../assets/tn-slide-2.svg";
import slide3 from "../assets/tn-slide-3.svg";

function FeatureCard({ title, desc }) {
  return (
    <div className="home-card gov-card">
      <div className="home-card__title">{title}</div>
      <div className="home-card__desc">{desc}</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      <PublicNavbar />

      <section className="home-hero">
        <div className="home-hero__bg" aria-hidden="true">
          <img className="home-hero__img" src={heroImg} alt="" />
        </div>

        <div className="home-hero__inner home-hero__split">
          <div className="home-hero__left">
            <div className="home-brand">
              <div className="home-brand__name">FixMyCity Pro</div>
              {/* <div className="home-brand__sub">Public Complaint Management System</div>
              <div className="home-brand__tag">Report. Track. Resolve.</div> */}
            </div>
            <div className="home-hero__badge">Tamil Nadu</div>
            <h1 className="home-hero__title">Public Complaint Management System - Tamil Nadu</h1>
          
            <p className="home-hero__sub">
              Report and track public issues like water, electricity, roads, sanitation, housing, and more. Built for fast
              resolution and clear accountability.
            </p>

            <div className="home-hero__actions">
              <Link className="home-btn home-btn--primary" to="/register">
                Register Complaint
              </Link>
              <Link className="home-btn home-btn--ghost" to="/login">
                Login
              </Link>
            </div>
          </div>

          <div className="home-hero__right">
            <ImageSlider
              slides={[
                {
                  alt: "Damaged road / potholes",
                  sources: [
                    "/slides/damaged-roads.jpg",
                    "https://source.unsplash.com/1600x900/?pothole,road,damage",
                    "https://loremflickr.com/1600/900/pothole,road",
                  ],
                },
                {
                  alt: "Improper / broken street lights",
                  sources: [
                    "/slides/broken-street-light.jpg",
                    "https://source.unsplash.com/1600x900/?streetlight,night",
                    "https://loremflickr.com/1600/900/streetlight,night",
                  ],
                },
                {
                  alt: "Sanitation and garbage issues",
                  sources: [
                    "/slides/sanitation-garbage.jpg",
                    "https://source.unsplash.com/1600x900/?garbage,street,sanitation",
                    "https://loremflickr.com/1600/900/garbage,street",
                  ],
                },
              ]}
              fallbackImages={[slide1, slide2, slide3]}
              altPrefix="Tamil Nadu issue"
            />
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__title">Features</div>
        <div className="home-grid">
          <FeatureCard title="Easy Complaint Registration" desc="Submit complaints with department and TN location in seconds." />
          <FeatureCard title="Track Complaint Status" desc="Monitor progress: Pending, In Progress, Waiting for Confirmation, and Resolved updates." />
          <FeatureCard title="Admin Dashboard Monitoring" desc="Admins review, filter by district, and manage resolution." />
        </div>
      </section>

      <section className="home-section home-section--about">
        <div className="home-section__title">About</div>
        <p className="home-about">
          This platform supports district-wise complaint tracking across Tamil Nadu. Complaints are recorded with a
          standardized TN location format and can be filtered by district for better operational insight.
        </p>
      </section>

      <footer className="home-footer">
        <div className="home-footer__inner">Government-style demo UI. Data is managed via secure admin access.</div>
      </footer>
    </div>
  );
}
