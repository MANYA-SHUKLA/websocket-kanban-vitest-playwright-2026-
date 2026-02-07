import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__text">
        Made with <span className="footer__heart">♥</span> by{" "}
        <a
          href="https://manyashukla.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__link"
        >
          Manya Shukla
        </a>{" "}
        © 2026
      </p>
      <nav className="footer__links">
        <a
          href="https://manyashukla.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__nav-link"
        >
          Portfolio
        </a>
      </nav>
    </footer>
  );
}
