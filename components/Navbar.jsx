"use client";
import { useState, useEffect } from "react";
import ButtonPlay from "./ButtonPlay.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth > 1080) setOpen(false);
    };
    window.addEventListener("resize", closeMenuOnResize);
    return () => window.removeEventListener("resize", closeMenuOnResize);
  }, []);

  return (
    <nav className="nav">
      {/* LADO IZQUIERDO: Hamburguesa (mobile) o Links (desktop) */}
      <div className="nav-side left-side">
        <button
          aria-label="Toggle menu"
          className="nav-toggle"
          onClick={() => setOpen(!open)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        <div className="nav-group desktop-only">
          <a href="/news">INICIO</a>
          <a href="/artists">PROGRAMACIÓN</a>
        </div>
      </div>

      {/* CENTRO: Logo siempre centrado */}
      <div className="nav-logo">
        <a href="/">
          <img src="/brand6.png" alt="Brand" />
        </a>
      </div>

      {/* LADO DERECHO: Links (desktop) + ButtonPlay (siempre) */}
      <div className="nav-side right-side">
        <div className="nav-group desktop-only">
          <a href="/store">NOSOTROS</a>
          <a href="/contact">CONTACT</a>
        </div>
        <ButtonPlay />
      </div>

      {/* MENÚ DESPLEGABLE MOBILE */}
      <div className={`nav-mobile ${open ? "show" : ""}`}>
        <a onClick={() => setOpen(false)} href="/news">NEWS</a>
        <a onClick={() => setOpen(false)} href="/artists">ARTISTS</a>
        <a onClick={() => setOpen(false)} href="/releases">RELEASES</a>
        <a onClick={() => setOpen(false)} href="/store">STORE</a>
        <a onClick={() => setOpen(false)} href="/contact">CONTACT</a>
      </div>
    </nav>
  );
}