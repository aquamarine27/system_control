import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { getAuthHeaders, api } from "../services/authService"; 

export default function Navbar() {
  const [username, setUsername] = useState("aquamarine"); 
  const [role, setRole] = useState("Everyone"); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info...");
        const response = await api.get("/user-info", {
          headers: getAuthHeaders(),
        });
        console.log("Response received:", response.status, response.data);
        if (response.status === 200) {
          const data = response.data;
          setUsername(data.login || "aquamarine");
          setRole(data.role ? data.role.toString() : "Everyone");
          localStorage.setItem("login", data.login);
          localStorage.setItem("role", data.role ? data.role.toString() : "Everyone");
        } else {
          setError(`Unexpected status: ${response.status}`);
          console.error("Unexpected response:", response.data);
        }
      } catch (error) {
        setError(`Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
        console.error("Fetch error:", error.response?.status, error.response?.data || error.message);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("login");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="navbar-container">
      <div className="navbar-header">
        <img src="/favicon.svg" alt="System Control Logo" className="navbar-logo" />
        <div className="navbar-title">systemControl</div>
      </div>
      <nav className="navbar-nav">
        <a href="/" className="navbar-link navbar-active">
          <svg className="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L5 10M5 10L12 3L21 12L19 14M5 10L19 14M21 12H12V21L21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </a>
        <a href="/profile" className="navbar-link">
          <svg className="navbar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Profile
        </a>
      </nav>
      <div className="navbar-user">
        <div className="navbar-separator"></div>
        <span className="navbar-username">{username}</span>
        <span className="navbar-role">Role: {role}</span>
        {error && <span style={{ color: "red" }}>Error: {error}</span>}
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}