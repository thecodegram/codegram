import express, { Request, Response } from 'express'
import { User } from '../model/schemas/userSchema'

import { isValidUsername } from '../utils/utils';

const router = express.Router();

// Add some parameters to the session
declare module "express-session" {
    interface SessionData {
        username: string // whatever property you like
    }
}

const decryptPassword = (pwd: String) => { return pwd };
router.post('/login', async (req: Request, res: Response) => {
    const username: String = req.body.username;
    const password: String = req.body.password;

    if (isValidUsername(username)) {
        const password1 = decryptPassword(password);
        try {
            const user = await User.findOne({ username: username, password: password1 });
            console.log(user);

            if (user === null) {
                res.status(400).send();
            }
            else {
                console.log(user);
                req.session.username = user.username;
                req.session.save()

                res.status(200).send("Logged in successfully");
            }

        } catch (e: any) {
            res.status(400).end();
        }
    }
    else {
        res.status(400).end();
    }
})


router.post('/signup', async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    console.log(username, email)
    try {
        const user = await User.findOne({ $or: [{ username: username }, { email: email }] });

        if (user !== null) {
            res.status(400).send("User already exists!");
            console.log(user);
            return;
        }
        else {
            const newUser = new User({
                username: username,
                password: password,
                email: email
            })

            await newUser.save();

            // Init the user session
            req.session.username = newUser.username;
            req.session.save()


            res.status(200).send("Registered");
        }
    } catch (e: any) {
        console.log(e);
        // Not sure if we should specify what went wrong with login/signup
        // For security reasons
        res.status(400).end("Error signing in");
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect the user to the login page or any other desired destination
            res.status(200).send('Logged out');
        }
    });
})

router.get('/check', (req: Request, res: Response) => {
    if (req.session && req.session.username) {
        res.status(200).send(req.session.username).end();
    } else {
        res.status(401).end();
    }
});


module.exports = router;