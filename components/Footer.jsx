
import NewsletterForm from "./Newsletter";

function FooterSite() {
  return (
    <div className="footer-container">

      <div className="footer-newsletter-container">
        <div className="footer-newsletter-icons">

          <div className="newsletter-title">
            <img src="/email.png" className="newsletter-title-icon" />
            <div className="newsletter-title-text">
              <p>SUBSRIBE TO THE NEWSLETTER!</p>
            </div>
          </div>

          <div className="newsletter-input">
            <NewsletterForm />
          </div>

          <div className="social-icons">
            <a href="https://www.facebook.com">
              <img src="/facebook.png" className="social-icon" />
            </a>
            <a href="https://www.twitter.com">
              <img src="/twitter.png" className="social-icon" />
            </a>
            <a href="https://www.instagram.com">
              <img src="/instagram.png" className="social-icon" />
            </a>
          </div>
        </div>

        <div className="footer-copyright-container">
          <p> © 2024 GLOOM RECORDS. All rights reserved.</p>
        </div>
      </div>

      <div className="footer-brand-container">
        <img className="footer-brand-image" src="/footer-brand.png" />
      </div>

      <div className="footer-terms-container">
        <div className="footer-terms">
          <a className="terms-link" href=""><p>PRIVACY POLICY</p></a>
          <a className="terms-link" href=""><p>TERMS AND CONDITIONS</p></a>
          <a className="terms-link" style={{ borderBottom: "none" }} href=""><p>FREQUENTLY QUESTIONS</p></a>
        </div>
        <div className="footer-make-by">
          <p>Make with ♥♥♥ by JAVIVI & CATITA</p>
        </div>
      </div>

    </div>
  );
}

export default FooterSite;
