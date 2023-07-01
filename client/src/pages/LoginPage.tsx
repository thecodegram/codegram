import React from "react";
import styles from "./LoginPage.module.css";
import { IconGoogleLogo } from "./icon-google-logo";

// import SignInUpButtonGoogle from "../components/SignInUpButtonGoogle";


const LoginPage = () => {
  console.log(styles);
  return (
    <main className={styles.loginPage}>
      <header className={styles.header}>
        <div className={styles.logo}>Cg</div>
        <h1>Welcome to <span>Codegram</span></h1>
        <p>Please Log In with your email to continue</p>
      </header>
      <form action="" className={styles.form}>
        <button type="button" className={`${styles.btn} ${styles.googleLoginBtn}`}><IconGoogleLogo />Continue with Google</button>
        <span className={styles.orLine}>OR</span>
        <input className={styles.inputText} type="text" name="email" placeholder="Email" />
        <div>
          <input className={styles.inputText} type="text" name="Password" placeholder="Password" />
          <a href="">
            <p>Forgot your password?</p>
          </a>
        </div>
        <div>
          <button type="submit" className={styles.btn}>Login</button>
          <p>Don't have an account? <a href="">Sign Up</a></p>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
