import React from "react";
import styles from "./SignupPage.module.css";
import { IconGoogleLogo } from "../icons/icon-google-logo";

// for refrence:
// 16 px is 1 rem whcih is the original size of the font for most stuff, base on that most of the sizes are calculated
// so we do x pixels / 16 to get the rem value

const SignupPage = () => {
  return (
    <main className={styles.SignupPage}>
      <header className={styles.header}>
        <div className={styles.logo}>Cg</div>
        <h1>
          <span>Codegram</span> where code meets the community
        </h1>
        <p>lets get you started</p>
      </header>
      <form className={styles.form}>
        <button
          type="button"
          className={`${styles.btn} ${styles.googleLoginBtn}`}
        >
          <IconGoogleLogo />
          Sign up with Google
        </button>
        <span className={styles.orLine}>OR</span>
        <input
          type="text"
          name="email"
          placeholder="Email"
          className={styles.inputText}
        />
        <input
          type="text"
          name="password"
          placeholder="password"
          className={styles.inputText}
        />
        <div>
          <button type="submit" className={styles.btn}>
            Sign Up
          </button>
          <p>
            Already have an accout?{" "} <a href="/">Sign In</a>
          </p>
        </div>
      </form>
    </main>
  );
};

export default SignupPage;
