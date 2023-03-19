const express = require("express");
const app = express();
app.use(express.json());
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

//send e-mail message
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/v1/notifications/email", (req, res) => {

  const to = req.body["send_to"];
  const subject = req.body["subject"];
  const text = req.body["text"];
  const html = req.body["html"];
  const attachments = req.body["attachments"];

  if(attachments != null)
  {
    for (var i = 0; i < attachments.length; i++) {
      attachments[i]["disposition"] = "attachment";
    }
  }

  const msg = {
    to: to,
    from: "xxxx@outlook.com",
    subject: subject,
    text: text,
  };
  
  if(html != null)
  {
    msg["html"] = html;
  }

  if(attachments != null)
  {
    msg["attachments"] = attachments;
  }
  
  console.log(msg);
  sgMail.send(msg)
  .then(() => {
    console.log(`Email sent to ${msg.to}`);
  })
  .catch((err) => {
    console.log(err);
    res.json(err).end();
    return;
  });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
