import { CorsOptions } from 'cors'

const whitelist = ['','http://localhost:5000', 'http://localhost:3000', 'http://localhost:8080/', 'https://codegram-web.onrender.com'];
export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        console.log(origin);
        if (whitelist.includes(origin || '')) {
            callback(null, true);
        } else {
            console.log("Not allowed by CORS")
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
};
