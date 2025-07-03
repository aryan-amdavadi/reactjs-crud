import React, {useState} from "react";
import Navbar from "./Navbar";
import "./home.css";
import { Link } from "react-router-dom";

function HomePage() {
  const [loadData, setLoadData] = useState(0);
  return (
    <>
      <Navbar loadData={loadData} setLoadData={setLoadData} />

      <div className="home">
        {/* HERO SECTION */}
        <section className="hero">
          <h1>
            Welcome to <span className="brand">Tabster</span>
          </h1>
          <p>
            Your one-stop shop for thoughtfully crafted products — beautifully
            designed, consciously sourced, and delivered with care.
          </p>
          <Link className="btn cta-button" to="/menu">
            Shop Now
          </Link>
        </section>

        {/* FEATURES SECTION */}
        <section className="section features">
          <h2>Why Shop with Tabster?</h2>
          <div className="cards">
            <div className="card">
              <h3>🌿 Handpicked Quality</h3>
              <p>
                We source only the finest ingredients and materials to ensure
                your satisfaction with every purchase.
              </p>
            </div>
            <div className="card">
              <h3>🚚 Fast, Reliable Delivery</h3>
              <p>
                Get your favorites delivered quickly and securely — wherever you
                are, whenever you need them.
              </p>
            </div>
            <div className="card">
              <h3>💖 Customer First</h3>
              <p>
                Our support team is here for you, ensuring a smooth and
                delightful shopping experience every time.
              </p>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="section about">
          <h2>About Tabster</h2>
          <p>
            Tabster isn't just a store — it's a lifestyle choice. We're
            dedicated to curating high-quality, consciously made products that
            bring joy, comfort, and style to your everyday life. Whether you're
            browsing for artisan treats, elegant essentials, or thoughtful
            gifts, Tabster is your go-to destination for discovering the
            extraordinary in the everyday.
          </p>
          <p>
            Our mission is to simplify your shopping journey while offering a
            boutique-like feel, powered by modern technology and wrapped in
            timeless design. Join our community of mindful shoppers and
            experience the difference Tabster brings to your world.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>© 2025 Tabster. All rights reserved.</p>
          <div>
            <a href="/">Privacy Policy</a> | <a href="/">Terms of Service</a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default HomePage;
