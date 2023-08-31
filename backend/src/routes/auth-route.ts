import express, { Request, Response } from "express";
import { User } from "../model/schemas/userSchema";
import { UserRepository } from "../repository/UserRepository";
import { isValidUsername } from "../utils/utils";
import { emailService } from "../services/EmailService";
import { recaptchaService } from "../services/RecaptchaService";
import { enforceLoggedIn } from "../utils/middleware";
import axios from "axios";
const bcrypt = require("bcryptjs");

const router = express.Router();

const userRepository = new UserRepository();
const GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

router.post("/googleSignIn", async (req: Request, res: Response) => {
  const { access_token } = req.body;

  try {
    const response = await axios.get(
      `${GOOGLE_TOKENINFO_URL}?access_token=${access_token}`
    );
    console.log(response.data);
    const { email_verified, email } = response.data;

    if (email_verified == "true") {
      const user = await User.findOne({ email: email });
      if (user) {
        const username = user.username;
        const postgresUser = await userRepository.getUser(username);
        console.log(postgresUser)

        req.session.username = username;
        req.session.userId = postgresUser.id;
        req.session.save();

        if (!user.leetcode?.username && !user.vjudge?.username) {
          res.status(200).json({ status: "onboarding" });
        } else {
          res.status(200).json({ status: "dashboard" });
        }
      } 
      else {
        const newUser = new User({
          username: '',
          password: '',
          email: email,
        });

        newUser.username = 'user' + newUser._id;
        await newUser.save();
        const postgresId = await userRepository.saveUser(newUser._id.toString(), newUser.username);
        req.session.username = newUser.username;
        req.session.userId = postgresId;
        req.session.save();

        if (!newUser.leetcode?.username && !newUser.vjudge?.username) {
          res.status(200).json({ status: "onboarding" });
        } else {
          res.status(200).json({ status: "dashboard" });
        }
        return;
      }
    } else {
      res.status(200).json({ verified: false });
      return;
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password, recaptchaToken } = req.body;

  const isRecaptchaValid = await recaptchaService.verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    res.status(400).send({ error: "Invalid reCAPTCHA token." });
    return;
  }

  if (password == '') {
    res.status(400).send({ error: "Password must not be blank!"});
  }

  if (isValidUsername(username)) {
    try {
      const user = await User.findOne({ username: username }); // if the username doesn't exist, we don't need to check for password

      if (user === null) {
        res.status(400).send({ error: "User does not exist!" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(400).send({ error: "Invalid password" });
        return;
      }

      const postgresUser = await userRepository.getUser(username);

      if (user === null || !postgresUser) {
        res.status(400).send();
      } else {
        req.session.username = user.username;
        req.session.userId = postgresUser.id;
        req.session.save();

        if (!user.leetcode?.username && !user.vjudge?.username) {
          res.status(200).json({ status: "onboarding" });
        } else {
          res.status(200).json({ status: "dashboard" });
        }
      }
    } catch (e: any) {
      console.log(e);
      res.status(400).end();
    }
  } else {
    console.log("Invalid username");
    res.status(400).end();
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const { username, password, email, recaptchaToken } = req.body;

  console.log(username, email);

  const isRecaptchaValid = await recaptchaService.verifyRecaptcha(recaptchaToken);

  if (!username) {
    res.status(400).json({ error: "username is empty" });
    return;
  }
  if (!isRecaptchaValid) {
    res.status(400).send({ error: "Invalid reCAPTCHA token." });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user !== null) {
      res.status(400).send("User already exists!");
      return;
    } else {
      const newUser = new User({
        username: username,
        password: hashedPassword,
        email: email,
      });

      const registedUser = await newUser.save();
      console.log("New user mongoId: " + registedUser._id.toString());
      //save to postgresql

      const userId = await userRepository.saveUser(
        registedUser._id.toString(),
        registedUser.username
      );

      // Init the user session
      req.session.username = newUser.username;
      req.session.userId = userId;
      req.session.save();

      await emailService.sendWelcomeEmail(email, username);

      res.status(200).send("Registered");
    }
  } catch (e: any) {
    console.log(e);
    // Not sure if we should specify what went wrong with login/signup
    // For security reasons
    res.status(400).end("Error signing in");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Redirect the user to the login page or any other desired destination
      // res.status(200).send("Logged out");
      res.redirect(200, '../login')
    }
  });
});

router.get("/check", [enforceLoggedIn], async (req: Request, res: Response) => {
  if (req.session && req.session.username) {
    const userInfo = await userRepository.getUser(req.session.username);

    // Check if userInfo is defined
    if (!userInfo) {
      res.status(404).send({ error: "User not found" }).end();
    } else {
      res
        .status(200)
        .send({ username: req.session.username, userId: userInfo.id })
        .end();
    }
  } else {
    res.redirect(401, '/login');
  }
});

module.exports = router;
