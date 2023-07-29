import express, { Request, Response } from "express";
import { User } from "../model/schemas/userSchema";
import { UserRepository } from "../repository/UserRepository";
import { isValidUsername } from "../utils/utils";

const router = express.Router();

const nodeMailer = require("nodemailer");

const userRepository = new UserRepository();

// Add some parameters to the session
declare module "express-session" {
  interface SessionData {
    username: string; // whatever property you like
  }
}

const decryptPassword = (pwd: String) => {
  return pwd;
};
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (isValidUsername(username)) {
    const password1 = decryptPassword(password);
    try {
      const user = await User.findOne({
        username: username,
        password: password1,
      });
      console.log(user);

      if (user === null) {
        res.status(400).send();
      } else {
        req.session.username = user.username;
        req.session.save();

        if (!user.leetcode?.username && !user.vjudge?.username) {
          res.status(200).json({ status: "onboarding" });
        } else {
          res.status(200).json({ status: "dashboard" });
        }
      }
    } catch (e: any) {
      res.status(400).end();
    }
  } else {
    res.status(400).end();
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  console.log(username, email);
  try {
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (user !== null) {
      res.status(400).send("User already exists!");
      console.log(user);
      return;
    } else {
      const newUser = new User({
        username: username,
        password: password,
        email: email,
      });

      const registedUser = await newUser.save();

      console.log(registedUser);
      console.log("this is the id: " + registedUser._id.toString());
      //save to postgresql
      if (registedUser.username && registedUser._id) {
        userRepository.saveUser(
          registedUser._id.toString(),
          registedUser.username
        );
      } else {
        console.log("username is undefined");
      }

      // Init the user session
      req.session.username = newUser.username;
      req.session.save();

      // send email
      var transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
          user: "kodygramme@gmail.com",
          pass: "buaknommahtbfzpu",
        },
      });

      // Update the text property to include an anchor tag with the YouTube link
      var mailOptions = {
        from: "kodygramme@gmail.com",
        to: "zhiani2000@gmail.com", // shramko.georgiy@gmail.com BRUHHHH
        subject: "You have been invited to collaborate on CodeGram",
        html: "<p>@shaygeko has invited you to collaborate on CodeGram, <a href='https://www.youtube.com/watch?v=j5a0jTc9S10&list=PL3KnTfyhrIlcudeMemKd6rZFGDWyK23vx&index=11&ab_channel=YourUncleMoe'>click to join</a></p>",
      };

      transporter.sendMail(
        mailOptions,
        function (error: any, info: { response: string }) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );

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
      res.status(200).send("Logged out");
    }
  });
});

router.get("/check", (req: Request, res: Response) => {
  if (req.session && req.session.username) {
    res.status(200).send(req.session.username).end();
  } else {
    res.status(401).end();
  }
});

module.exports = router;
