import React, { useState } from "react";
import axios from "axios";
import styles from "./LoginPage.module.css";
import { IconGoogleLogo } from "./icon-google-logo";

// 16 px is 1 rem whcih is the original size of the font for most stuff, base on that most of the sizes are calculated
// so we do x pixels / 16 to get the rem value

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
        "http://localhost:8080/api/login",
        payload
      );
      console.log(response.data);
      // Handle login logic here
    } catch (error) {
      console.error(error);
    }
  };
  //   console.log(styles);
  return (
    <main className={styles.loginPage}>
      <header className={styles.header}>
        <div className={styles.logo}>Cg</div>
        <h1>
          Welcome to <span>Codegram</span>
        </h1>
        <p>Please Log In with your email to continue</p>
        {error && <p>{error}</p>}
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
        <input
          className={styles.inputText}
          type="text"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <input
            className={styles.inputText}
            type="password"
            name="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="">
            <p>Forgot your password?</p>
          </a>
        </div>
        <div>
          <button type="submit" className={styles.btn}>
            Login
          </button>
          <p>
            Don't have an account? <a href="">Sign Up</a>
          </p>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
