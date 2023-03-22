const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.json());
const port = 3030;

const dotenv = require("dotenv").config();
if (dotenv.error) {
  console.error("Error occurred while setting dot env files : ", dotenv.error);
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

// send SMS message with Twilio
app.post("/v1/notifications/sms", (req, res) => {
  const sendTo = req.body["send_to"];
  const body = req.body["msg_body"];

  client.messages
    .create({
      body: body,
      from: phoneNumber,
      to: sendTo,
    })
    .then((message) => {
      console.log(message.sid);
      res.json({ sid: message.sid }).end();
      return;
    })
    .catch((err) => {
      console.log(err);
      res.json(err).end();
      return;
    });
});

//send e-mail message with mailgun
const mailGun = require("mailgun-js")({
  apiKey: process.env.MAIL_GUN_API_KEY,
  domain: process.env.MAIL_GUN_DOMAIN,
});
app.post("/v1/notifications/email", (req, res) => {
  const { to, subject, text } = req.body;

  const data = {
    from: process.env.FROM_EMAIL_GUN,
    to,
    subject,
    text,
  };
  mailGun.messages().send(data, (error, body) => {
    console.log(`Email sent to ${data.to}`);
  });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
