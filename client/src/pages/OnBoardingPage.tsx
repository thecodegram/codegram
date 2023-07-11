import React from 'react'
import styles from './OnBoardingPage.module.css'

const OnBoardingPage = () => {
  return (
    <main className={styles.OnBoardingPage}>
      <header className={styles.header}>
        <h1>
          <span>One</span> Last Step...
        </h1>
        </header>
        <div className={styles.Card}>
          <form>
            <div className={styles.UploadPhoto}></div>
            <p>Please Select a Profile Picture, and Fill in At Least One of the Two Usernames</p>
            <div></div>
            <div></div>
            <button type="submit" className={styles.btn}> Continue</button>
          </form>
        </div>
    </main>
  )
}

export default OnBoardingPage