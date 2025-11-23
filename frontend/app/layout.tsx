import './globals.css';
import Header from '../components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-wrap">
            <div className="footer-col">
              <h4>Offer</h4>
              <a href="#">Orange Flex for you</a>
              <a href="#">Orange Flex for Business</a>
              <a href="#">Orange Flex for Students</a>
            </div>
            <div className="footer-col">
              <h4>Number portability</h4>
              <a href="#">Transfer number to Flex</a>
              <a href="#">Transfer number for companies</a>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="#">eSIM</a>
              <a href="#">MultiSIM and additional numbers</a>
              <a href="#">UNLMTD: unlimited internet</a>
              <a href="#">Roaming and international calls</a>
            </div>
            <div className="footer-col">
              <h4>More to discover</h4>
              <a href="#">Flex climate</a>
              <a href="#">Flex for shortcuts</a>
              <a href="#">Blog</a>
              <a href="#">Help</a>
            </div>
          </div>
          <div className="footer-social">
            <h4>Join us</h4>
            <div className="social-icons">
              <a className="social-btn" href="#" aria-label="TikTok">🎵</a>
              <a className="social-btn" href="#" aria-label="Instagram">📸</a>
              <a className="social-btn" href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <div className="footer-legal">
            <a href="#">Regulations and price lists</a>
            <a href="#">Important messages</a>
            <a href="#">Data</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Barrier-free</a>
            <a href="#">Change cookie settings</a>
          </div>
          <div className="footer-bottom">
            <span>©2025 Orange Polska SA. All rights reserved.</span>
            <span>English · Bright mode</span>
          </div>
        </footer>
      </body>
    </html>
  );
}