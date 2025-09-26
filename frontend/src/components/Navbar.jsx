import React from 'react';
import '../styles/navbar.css';

export default function Navbar() {
  return (
    <div className="navbar-container">
      <div className="navbar-header">
        <img src="/favicon.svg" alt="System Control Logo" className="navbar-logo" />
        <div className="navbar-title">systemControl</div>
      </div>
      <nav className="navbar-nav">
        <a href="#" className="navbar-link navbar-active">
          <svg className="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L21 12L19 14M5 10L19 14M21 12H12V21L21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </a>
        <a href="#" className="navbar-link">
          <svg className="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Profile
        </a>
      </nav>
      <div className="navbar-user">
        <div className="navbar-separator"></div>
        <span className="navbar-username">aquamarine</span>
        <span className="navbar-role">Role: Everyone</span>
        <button className="navbar-logout">Logout</button>
      </div>
    </div>
  );
}