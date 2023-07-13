import React, { useState } from "react";
import styles from "./SignupPage.module.css";
import axios from "axios";
import { IconGoogleLogo } from "../icons/icon-google-logo";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// for refrence:
// 16 px is 1 rem whcih is the original size of the font for most stuff, base on that most of the sizes are calculated
// so we do x pixels / 16 to get the rem value

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordType, setPasswordType] = useState("password");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter all fields");
      return;
    }

    const payload = {
      username: username,
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Successful signup? do i still show this?
        localStorage.setItem("isLoggedIn", "true");

        navigate("/onboarding", { state: { username } });

      } else {
        setError("Invalid signup information. Please try again.");
      }
    } catch (error) {
      setError("Failed to signup. Please try again.");
    }
  };

  const handleSigninClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    navigate("/login");
  };

  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  return (
    <main className={styles.SignupPage}>
      <header className={styles.header}>
        <div className={styles.logo}>Cg</div>
        <h1>
          <span>Codegram</span> where code meets the community
        </h1>
        <p>lets get you started</p>
      </header>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button
          type="button"
          className={`${styles.btn} ${styles.googleLoginBtn}`}
        >
          <IconGoogleLogo />
          Sign up with Google
        </button>
        <span className={styles.orLine}>OR</span>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          className={styles.inputText}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          className={styles.inputText}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className={styles.passwordWrapper}>
          <input
            type={passwordType}
            name="password"
            placeholder="Password"
            className={styles.inputText}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className={styles.eyeIcon} onClick={togglePassword}>
            {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
          </i>
        </div>
        <div>
          <button type="submit" className={styles.btn}>
            Sign Up
          </button>
          <p>
            Already have an accout?{" "}
            <a href="/login" onClick={handleSigninClick}>
              Sign In
            </a>
          </p>
        </div>
      </form>
    </main>
  );
};

export default SignupPage;
