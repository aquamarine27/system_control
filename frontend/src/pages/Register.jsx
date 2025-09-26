import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation check
    if (email.includes("@") && password.length >= 3 && password === confirmPassword) {
      // Placeholder for backend API call
      localStorage.setItem("token", "fake-jwt-token");
      navigate("/login");
    }
  };

  return (
    <>
      <title>systemControl - Register</title>
      <div className="register-page">
        <svg className="background-waves" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10 0 C 10 10, 12 20, 10 30 C 8 40, 12 50, 10 60 C 8 70, 12 80, 10 120 C 10 100, 10 100, 10 100"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            className="wave-line"
          />
          <path
            d="M 30 0 C 30 25, 35 35, 30 55 C 25 75, 35 85, 30 100"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            className="wave-line"
          />
          <path
            d="M 60 0 C 60 30, 65 40, 60 60 C 55 80, 65 90, 60 100"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            className="wave-line"
          />
          <path
            d="M 80 0 C 80 35, 85 45, 80 65 C 75 85, 85 95, 80 100"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            className="wave-line"
          />
        </svg>
        <div className="register-container">
          <h2>Create an account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            {/* Email Input Section */}
            <div className="register-input-wrapper">
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
              <span className={`register-placeholder ${emailFocused || email ? "register-placeholder-active" : ""}`}>
                Email
              </span>
            </div>

            {/* Password Input Section */}
            <div className="register-input-wrapper">
              <div className="register-password-container">
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
                  className="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img src={showPassword ? `/eye-show.svg` : `/eye-hide.svg`} alt="Toggle Password" />
                </button>
              </div>
              <span className={`register-placeholder ${passwordFocused || password ? "register-placeholder-active" : ""}`}>
                Enter your password
              </span>
            </div>

            {/* Confirm Password Input Section */}
            <div className="register-input-wrapper">
              <div className="register-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => {
                    if (!confirmPassword) setConfirmPasswordFocused(false);
                  }}
                  required
                />
                <button
                  type="button"
                  className="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img src={showPassword ? `/eye-show.svg` : `/eye-hide.svg`} alt="Toggle Confirm Password" />
                </button>
              </div>
              <span className={`register-placeholder ${confirmPasswordFocused || confirmPassword ? "register-placeholder-active" : ""}`}>
                Confirm your password
              </span>
            </div>

            {/* Submit Button */}
            <button type="submit">Create account</button>
          </form>

          {/* Login Link Section */}
          <p className="register-login-text">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </>
  );
}