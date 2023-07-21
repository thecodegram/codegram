import { env } from "./env";

export const sessionOptions = {
    name: 'mysession',
    secret: env.AUTH_SECRET_KEY!!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000, // 1 hour in milliseconds
        sameSite: 'none' as 'none',
        secure: true,
        domain: 'codegram-api-vrlbmknooq-uc.a.run.app',
    }
}
