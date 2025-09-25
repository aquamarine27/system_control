import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation check
    if (email.includes("@") && password.length >= 3) {
      // Placeholder for backend API call
      localStorage.setItem("token", "fake-jwt-token");
      navigate("/");
    }
  };


  
  return (
    <>
      <title>systemControl - Login</title>
      <div className="login-page">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input Section */}
            <div className="login-input-wrapper">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  if (!email) setEmailFocused(false);
                }}
                required
              />
              <span className={`login-placeholder ${emailFocused || email ? "login-placeholder-active" : ""}`}>
                Email
              </span>
            </div>

            {/* Password Input Section */}
            <div className="login-input-wrapper">
              <div className="login-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    if (!password) setPasswordFocused(false);
                  }}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img src={showPassword ? `/eye-show.svg` : `/eye-hide.svg`} alt="Toggle Password" />
                </button>
              </div>
              <span className={`login-placeholder ${passwordFocused || password ? "login-placeholder-active" : ""}`}>
                Enter your password
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit">Login now</button>
          </form>

          {/* Signup Link Section */}
          <p className="login-signup-text">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </>
  );
}