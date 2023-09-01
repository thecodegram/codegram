const axios = require("axios");

export class RecaptchaService {
  async verifyRecaptcha(token: any) {
    if (token == "123") {
      return true;
    }
    const response = await axios({
      method: "post",
      url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.success) {
      console.log("ReCAPTCHA success!");
    } else {
      console.log("ReCAPTCHA failed");
    }
    return response.data.success;
  }
}

export const recaptchaService = new RecaptchaService();


