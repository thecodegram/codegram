import React, { useRef, useState } from "react";
import styles from "./SignupPage.module.css";
import axios from "axios";
import { IconGoogleLogo } from "../../icons/icon-google-logo";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from "react-google-login";

// for refrence:
// 16 px is 1 rem whcih is the original size of the font for most stuff, base on that most of the sizes are calculated
// so we do x pixels / 16 to get the rem value

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const navigate = useNavigate();

  const resetRecaptcha = () => {
    recaptchaRef.current?.reset();
  };

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
      recaptchaToken: recaptchaToken,
    };
    setError("");
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
      setRecaptchaToken(null);
      resetRecaptcha();
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

  const handleRecaptcha = (token: any) => {
    setRecaptchaToken(token); // store the recaptcha token
  };

  const onGoogleFailure = (response: any) => {
    console.log(response);
  };

  const onGoogleSuccess = async (response: any) => {
    setError("");
    try {
      // Send the Google access token to your backend for verification
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/googleSignin`, {
        access_token: response.accessToken,
      },
      { withCredentials: true }
      );
      if (res.data.status === "onboarding") {
        navigate("/onboarding");
      } else if (res.data.status === "dashboard") {
        navigate("/dashboard");
      }
      else {
      setError("Invalid username or password. Please try again.");
      setRecaptchaToken(null);
        resetRecaptcha();
    }
      
    } catch (error) {
      setError("Failed to signup. Please try again.");
      setRecaptchaToken(null);
      resetRecaptcha();
    }
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
        <GoogleLogin
          clientId="967455002287-6ck3jmsbapm0jfj0h46k5cc5ha2kg414.apps.googleusercontent.com"
          onSuccess={onGoogleSuccess}
          onFailure={onGoogleFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={false}
          render={(renderProps) => (
            <button
              type="button"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className={`${styles.btn} ${styles.googleLoginBtn}`}
            >
              <IconGoogleLogo />
              Sign up with Google
            </button>
          )}
        />
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
          pattern="/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
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
        <ReCAPTCHA
          ref={recaptchaRef}
          className={styles.recaptcha}
          sitekey="6Lev7GcnAAAAAI5flktV2-RN7p1ZSf7otKpReIP2"
          onChange={handleRecaptcha}
        />
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
