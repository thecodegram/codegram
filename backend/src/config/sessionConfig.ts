import { env } from "./env";
import {FirestoreStore} from "@google-cloud/connect-firestore";
import { Firestore } from '@google-cloud/firestore';

export const sessionOptions = {
    name: 'mysession',
    secret: env.AUTH_SECRET_KEY!!,
    resave: false,
    saveUninitialized: false,
    store: new  FirestoreStore({
        dataset: new Firestore(),
        kind: 'express-sessions',
      }),
    cookie: {
        maxAge: 3600000, // 1 hour in milliseconds
        sameSite: 'none' as 'none',
        secure: true,
        domain: 'backend2-c2h4n4r2vq-uw.a.run.app',
    }
}
