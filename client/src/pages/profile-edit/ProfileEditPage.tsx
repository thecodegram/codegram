import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./ProfileEditPage.module.css";
import { IconLeetCodeLogo } from "../../icons/icon-leetcode-logo";
import { IconVJudgeLogo } from "../../icons/icon-vjudge-logo";
import { IconAddPhoto } from "../../icons/import-photo-icon";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios, { AxiosError } from "axios";
import { UserContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useImageCache } from "../../components/image-cache-context/ImageCacheContext";

const ProfileEditPage = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [leetCodeUsername, setLeetCodeUsername] = useState("");
  const [vJudgeUsername, setVJudgeUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const { cache, setCache, removeFromCache } = useImageCache();
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { username, setUsername } = useContext(UserContext);
  const [passwordType, setPasswordType] = useState("password");
  const [oldPassword, setOldPassword] = useState("");
  const [oldUsername, setOldUsername] = useState("");
  const [OldEmail, setOldEmail] = useState("");
  const [OldVjudge, setOldVjudge] = useState("");
  const [OldLeetcode, setOldLeetcode] = useState("");

  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUploaded = event.target.files?.[0];
    if (fileUploaded) {
      setImageFile(fileUploaded);
      setImageUrl(URL.createObjectURL(fileUploaded));
    }
  };
  const handleGoBack = () => {
    navigate("/dashboard");
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/getCurrent/${username}`,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          const {
            leetcode: leetcodeUsername,
            vjudge: vjudgeUsername,
            password,
            email,
          } = response.data;
          setLeetCodeUsername(leetcodeUsername ?? "");
          setVJudgeUsername(vjudgeUsername ?? "");
          setCurrentPassword(password ?? "");
          setCurrentEmail(email ?? "");
          setOldPassword(password ?? "");
          setOldUsername(username ?? "");
          setOldEmail(email ?? "");
          setOldVjudge(vjudgeUsername ?? "");
          setOldLeetcode(leetcodeUsername ?? "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    setCurrentUsername(username ? username : "");
    const fetchProfilePic = async () => {
      if (username) {
        // this checks if username exists in cache and if it exists, set profilePic to cached data and if not fetch data from API and then updates the cache
        const currentCache = cache[username];
        if (currentCache === undefined || currentCache === null) {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/user/${username}/profilePicture`,
              {
                responseType: "blob",
                withCredentials: true,
              }
            );
            if (response.status !== 204) {
              const profilePicURL = URL.createObjectURL(response.data);

              setCache(username, profilePicURL);
              setImageUrl(profilePicURL);
            } else {
              setCache(username, "");
              setImageUrl("");
            }
          } catch (error) {
            console.error("Error fetching profile picture:", error);
          }
        } else {
          setImageUrl(currentCache.imageData);
        }
      }
    };

    if (username) {
      fetchAllData();
      fetchProfilePic();
    }
  }, [username, setCache]);
  /* eslint-disable react-hooks/exhaustive-deps */

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      (leetCodeUsername === "" && vJudgeUsername === "") ||
      username === "" ||
      currentEmail === ""
    ) {
      setErrorMsg(
        "Please ensure at least one of the platform usernames is provided and also ensure that the current password, email and username are provided."
      );
      return;
    }

    

    const formData = new FormData();
    formData.append("leetcodeUsername", leetCodeUsername);
    formData.append("vjudgeUsername", vJudgeUsername);
    formData.append("username", currentUsername);
    formData.append("email", currentEmail);
    formData.append("password", currentPassword);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (OldLeetcode === leetCodeUsername) {
      formData.delete("leetcodeUsername")
    } 
    if (OldVjudge === vJudgeUsername) {
      formData.delete("vjudgeUsername")
    } 
    if (oldUsername === currentUsername) {
      formData.delete("username")
    } 
    if (OldEmail === currentEmail) {
      formData.delete("email")
    } 
    if (oldPassword === currentPassword) {
      formData.delete("password")
    }

    setErrorMsg("");

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/${username}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        removeFromCache(currentUsername);
        removeFromCache(oldUsername);
        setImageUrl("");
        setUsername(currentUsername);
        navigate("/dashboard");
      } else {
        setErrorMsg("Something went wrong, please try again.");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (
        axiosError.response &&
        axiosError.response.data &&
        typeof axiosError.response.data === "string"
      ) {
        // If the API returned a detailed error message, use it
        setErrorMsg(axiosError.response.data);
      } else {
        // Otherwise, use a generic error message
        setErrorMsg("Failed to submit. Please try again.");
      }
    }
  };

  return (
    <main className={styles.OnBoardingPage}>
      <header className={styles.header}>
        <h1>
          <span>Edit</span> Profile
        </h1>
      </header>
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.UploadPhoto} onClick={handleClick}>
            {!imageUrl && <IconAddPhoto />}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Selected"
                className={styles.profileImg}
              />
            )}
            <input
              type="file"
              ref={hiddenFileInput}
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </div>
          <div className={styles.userInfo}>
            <label> Username : </label>
            <input
              type="text"
              placeholder="New Username"
              className={styles.inputTextUpdate}
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
            />
            <label> Email : </label>
            <input
              type="text"
              placeholder="New Email"
              className={styles.inputTextUpdate}
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
            />
            <label> Password : ( leave empty to keep the old password.) </label>
            <div className={styles.passwordWrapper}>
              <input
                type={passwordType}
                placeholder="New Password"
                className={styles.inputTextUpdate}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <i className={styles.eyeIcon} onClick={togglePassword}>
                {passwordType === "password" ? <FaEye /> : <FaEyeSlash />}
              </i>
            </div>
          </div>
          {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
          <div className={styles.miniCardHolder}>
            <div className={styles.miniCard}>
              <IconLeetCodeLogo />
              <input
                type="text"
                placeholder="LeetCode Username"
                className={styles.inputText}
                value={leetCodeUsername}
                onChange={(e) => setLeetCodeUsername(e.target.value)}
              />
            </div>
            <div className={styles.miniCard}>
              <IconVJudgeLogo />
              <input
                type="text"
                placeholder="VJudge Username"
                className={styles.inputText}
                value={vJudgeUsername}
                onChange={(e) => setVJudgeUsername(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className={styles.btn}>
            Submit
          </button>
          <button className={styles.btnCancel} onClick={handleGoBack}>
            Back to Home Page
          </button>
        </form>
      </div>
    </main>
  );
};

export default ProfileEditPage;
