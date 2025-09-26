import React from 'react';
import Navbar from '../components/Navbar';
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content">
        <div className="home-main">
          <h1>Добро пожаловать в Систему Контроля</h1>
          <p>123.</p>
        </div>
      </div>
    </div>
  );
}