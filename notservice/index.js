const express = require("express");
const app = express();
const port = 3030;

const dotenv = require("dotenv").config();
if (dotenv.error) {
  console.error("Error occurred while setting dot env files : ", dotenv.error);
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

app.post("/v1/notifications/sms", (req, res) => {
  client.messages
    .create({
      body: "Hi there, EGS Project",
      from: phoneNumber,
      to: "+351xxxxxx",
    })
    .then((message) => {
      console.log(message.sid);
      res.json({ sid: message.sid }).end();
      return;
    })
    .catch((err) => {
      res.json(error).end();
      return;
    });
});

//send e-mail message
const sgMail = require("@sendgrid/mail");
app.post("/v1/notifications/email", (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: "xxxx@outlook.com",
    from: "xxxx@outlook.com",
    subject: "EGS Project | Notification Service",
    text: "We notify you about your appointment",
    html: "<strong>Prapare your documents and get ready for it.</strong>",
  };
  sgMail.send(msg);
  console.log(`Email sent to ${msg.to}`);
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
