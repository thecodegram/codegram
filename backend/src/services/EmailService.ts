const nodeMailer = require("nodemailer");

export class EmailService {
  async sendWelcomeEmail(email: string, username: string) {
    // send email
    var transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Update the text property to include an anchor tag with the YouTube link
    var mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to CodeGram, ${username}`,
      html: `<p>Glad you're here, ${username}! </br> Watch our video below to get started with some tips and tricks! <a href='https://www.youtube.com/watch?v=j5a0jTc9S10&list=PL3KnTfyhrIlcudeMemKd6rZFGDWyK23vx&index=11&ab_channel=YourUncleMoe'>click to view</a></p>`,
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
  }
}

export const emailService = new EmailService();
