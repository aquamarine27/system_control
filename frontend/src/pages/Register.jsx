import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginFocused, setLoginFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [errors, setErrors] = useState({ login: "", password: "", confirmPassword: "" });
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

  const validateConfirmPassword = (passwordValue, confirmPasswordValue) => {
    if (passwordValue !== confirmPasswordValue) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const loginError = validateLogin(login);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    setErrors({
      login: loginError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (!loginError && !passwordError && !confirmPasswordError) {
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
      navigate("/login");
    }
  }, [showSuccessModal, countdown, navigate]);

  return (
    <>
      <title>systemControl - Register</title>
      <div className={`register-page ${showSuccessModal ? "blurred" : ""}`}>
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
        <div className={`register-container ${errors.login || errors.password || errors.confirmPassword ? "register-container-expanded" : ""}`}>
          <h2>Create an account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            {/* Login Input Section */}
            <div className="register-input-wrapper">
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
              <span className={`register-placeholder ${loginFocused || login ? "register-placeholder-active" : ""} ${errors.login ? "error-placeholder" : ""}`}>
                Login
              </span>
              {errors.login && (
                <span className="error-message">{errors.login}</span>
              )}
            </div>

            {/* Password Input Section */}
            <div className="register-input-wrapper">
              <div className="register-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({
                      ...errors,
                      password: validatePassword(e.target.value),
                      confirmPassword: validateConfirmPassword(e.target.value, confirmPassword),
                    });
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    if (!password) setPasswordFocused(false);
                    setErrors({
                      ...errors,
                      password: validatePassword(password),
                      confirmPassword: validateConfirmPassword(password, confirmPassword),
                    });
                  }}
                  className={errors.password ? "input-error" : ""}
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
              <span className={`register-placeholder ${passwordFocused || password ? "register-placeholder-active" : ""} ${errors.password ? "error-placeholder" : ""}`}>
                Enter your password
              </span>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Input Section */}
            <div className="register-input-wrapper">
              <div className="register-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({
                      ...errors,
                      confirmPassword: validateConfirmPassword(password, e.target.value),
                    });
                  }}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => {
                    if (!confirmPassword) setConfirmPasswordFocused(false);
                    setErrors({
                      ...errors,
                      confirmPassword: validateConfirmPassword(password, confirmPassword),
                    });
                  }}
                  className={errors.confirmPassword ? "input-error" : ""}
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
              <span className={`register-placeholder ${confirmPasswordFocused || confirmPassword ? "register-placeholder-active" : ""} ${errors.confirmPassword ? "error-placeholder" : ""}`}>
                Confirm your password
              </span>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
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
      
          {/*Modal-Content*/}
      {showSuccessModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <h3>Registration Successful!</h3>
            <img src="/success-icon.svg" alt="Success" className="auth-success-icon" />
            <p className="auth-redirect-text">Redirecting to login page in {countdown}...</p>
          </div>
        </div>
      )}
    </>
  );
}