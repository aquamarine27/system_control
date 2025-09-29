import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginFocused, setLoginFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({ login: "", password: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const validateLogin = (loginValue) => {
    if (loginValue.length < 5 || loginValue.length > 20) {
      return "Login must be between 5 and 20 characters";
    }
    // Placeholder for API call to check if login exists
    return "";
  };

  const validatePassword = (passwordValue) => {
    if (passwordValue.length < 3 || passwordValue.length > 20) {
      return "Password must be between 3 and 20 characters";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginError = validateLogin(login);
    const passwordError = validatePassword(password);

    setErrors({
      login: loginError,
      password: passwordError,
    });

    if (!loginError && !passwordError) {
      // Placeholder for backend API call
      localStorage.setItem("token", "fake-jwt-token");
      setShowSuccessModal(true);
      setCountdown(5); 
    }
  };

  useEffect(() => {
    if (showSuccessModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (showSuccessModal && countdown === 0) {
      setShowSuccessModal(false);
      navigate("/");
    }
  }, [showSuccessModal, countdown, navigate]);

  return (
    <>
      <title>systemControl - Login</title>
      <div className={`login-page ${showSuccessModal ? "blurred" : ""}`}>
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
        <div className={`login-container ${errors.login || errors.password ? "login-container-expanded" : ""}`}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            {/* Login Input Section */}
            <div className="login-input-wrapper">
              <input
                type="text"
                placeholder=" "
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setErrors({ ...errors, login: validateLogin(e.target.value) });
                }}
                onFocus={() => setLoginFocused(true)}
                onBlur={() => {
                  if (!login) setLoginFocused(false);
                  setErrors({ ...errors, login: validateLogin(login) });
                }}
                className={errors.login ? "input-error" : ""}
                required
              />
              <span className={`login-placeholder ${loginFocused || login ? "login-placeholder-active" : ""} ${errors.login ? "error-placeholder" : ""}`}>
                Login
              </span>
              {errors.login && (
                <span className="error-message">{errors.login}</span>
              )}
            </div>

            {/* Password Input Section */}
            <div className="login-input-wrapper">
              <div className="login-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: validatePassword(e.target.value) });
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    if (!password) setPasswordFocused(false);
                    setErrors({ ...errors, password: validatePassword(password) });
                  }}
                  className={errors.password ? "input-error" : ""}
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
              <span className={`login-placeholder ${passwordFocused || password ? "login-placeholder-active" : ""} ${errors.password ? "error-placeholder" : ""}`}>
                Enter your password
              </span>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
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

          {/*Modal-Content*/}
      {showSuccessModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <h3>Authorization Successful!</h3>
            <img src="/success-icon.svg" alt="Success" className="auth-success-icon" />
            <p className="auth-redirect-text">Redirecting to home page in {countdown}...</p>
          </div>
        </div>
      )}
    </>
  );
}