import { Link } from 'react-router-dom';
import campusCareersImage from '../../assets/images/campus-careers.jpg';

export default function Landing() {
  return (
    <main className="landing">
      <section className="hero landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow">Campus talent. Career-ready opportunities.</p>
          <h1>Bring campus talent and great careers together.</h1>
          <p className="landing-description">
            One secure place for colleges, students, and employers to connect
            through every step of campus recruitment.
          </p>
          <div className="cta">
            <Link className="btn btn-lg" to="/register-college">Register your college</Link>
            <Link className="btn btn-lg btn-white" to="/login">Explore the portal</Link>
          </div>
          <p className="landing-note">A connected placement journey, built for every campus.</p>
        </div>

        <div className="landing-visual">
          <img
            className="landing-image"
            src={campusCareersImage}
            alt="Students collaborating around a table as they prepare for their careers"
          />
          <div className="landing-image-caption">
            <span aria-hidden="true">✦</span>
            <div>
              <b>One community, more possibilities</b>
              <small>Colleges · Students · Employers</small>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-pathways" aria-labelledby="pathways-title">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Get started</p>
          <h2 id="pathways-title">Your next step starts here</h2>
          <p>Choose the path that matches you and join the placement community.</p>
        </div>
        <div className="landing-pathway-grid">
          <article className="landing-pathway">
            <span className="landing-pathway-icon" aria-hidden="true">🎓</span>
            <h3>Colleges</h3>
            <p>Bring your placement team and students into one organized workspace.</p>
            <Link to="/register-college">Register a college <span aria-hidden="true">→</span></Link>
          </article>
          <article className="landing-pathway">
            <span className="landing-pathway-icon" aria-hidden="true">🏢</span>
            <h3>Employers</h3>
            <p>Meet campus talent and coordinate opportunities with placement teams.</p>
            <Link to="/register-company">Register a company <span aria-hidden="true">→</span></Link>
          </article>
          <article className="landing-pathway">
            <span className="landing-pathway-icon" aria-hidden="true">🚀</span>
            <h3>Students &amp; teams</h3>
            <p>Sign in to follow applications, placement drives, and recruitment activity.</p>
            <Link to="/login">Go to your portal <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>
    </main>
  );
}
