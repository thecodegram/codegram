const nodeMailer = require("nodemailer");

export async function sendWelcomeEmail(email: string) {
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
}
