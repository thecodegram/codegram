const axios = require("axios");

// Load environment variables from .env file in development environment
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }  

export async function verifyRecaptcha(token: any) {
  const response = await axios({
    method: "post",
    url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  console.log(response.data.success);
  return response.data.success;
}
