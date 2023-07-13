import React, { useState } from "react";
import axios from "axios";
import styles from "./LoginPage.module.css";
import { IconGoogleLogo } from "../icons/icon-google-logo";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordType, setPasswordType] = useState("password");

  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter all fields");
      return;
    }

    const payload = {
      username: email,
      password: password,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        payload,
        { withCredentials: true }
      );

      if ((await response.status) === 200) {
        // localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (error) {
      setError("Failed to login. Please try again.");
    }
  };

  const handleSignupClick = (event: any) => {
    event.preventDefault();
    navigate("/signup");
  };

  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  return (
    <main className={styles.loginPage}>
      <header className={styles.header}>
        <div className={styles.logo}>Cg</div>
        <h1>
          Welcome to <span>Codegram</span>
        </h1>
        <p>Please Log In with your email to continue</p>
      </header>
      <form onSubmit={handleSubmit} className={styles.form}>
        <button
          type="button"
          className={`${styles.btn} ${styles.googleLoginBtn}`}
        >
          <IconGoogleLogo />
          Continue with Google
        </button>
        <span className={styles.orLine}>OR</span>
        {error && <p className={styles.error}>{error}</p>}
        <input
          className={styles.inputText}
          type="text"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className={styles.passwordWrapper}>
          <input
            className={styles.inputText}
            type={passwordType}
            name="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className={styles.eyeIcon} onClick={togglePassword}>
            {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
          </i>
          <a href="/">
            <p>Forgot your password?</p>
          </a>
        </div>
        <div>
          <button type="submit" className={styles.btn}>
            Log In
          </button>
          <p>
            Don't have an account?{" "}
            <a href="/signup" onClick={handleSignupClick}>
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
