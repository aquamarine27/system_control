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