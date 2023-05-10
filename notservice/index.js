const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
const port = 4000;

const dotenv = require("dotenv").config();
if (dotenv.error) {
  console.error("Error occurred while setting dot env files : ", dotenv.error);
}

// send SMS message with AWS SNS
app.post("/v1/notifications/sms", (req, res) => {
  const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
  const snsClient = new SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  let errors = {};
  if (!checkBodyJsonParams(req.body, errors, ["msg_body", "send_to"])) {
    res.status(400).send(errors);
    return;
  }

  const message = req.body["msg_body"];
  const phoneNumber = req.body["send_to"];

  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
  };
  const command = new PublishCommand(params);
  snsClient
    .send(command)
    .then((data) => {
      console.log("Message Id:", data.MessageId);
      console.log(`Message sent to ${params.PhoneNumber}`);
      res.status(200).send("Ok");
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.Error);
    });
});

// checks fields and creates an informative error message
function checkBodyJsonParams(body, result, params) {
  let failed = false;
  result["Errors"] = [];
  for (p of params) {
    if (!body[p]) {
      failed = true;
      result["Errors"].push(`Missing field ${p}`);
    }
  }

  if (failed) {
    return false;
  }
  return true;
}

// send e-mail message with AWS SES
// https://github.com/strapi/strapi/issues/9270
app.post("/v1/notifications/email", (req, res) => {
  const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");

  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  let errors = {};
  if (
    !checkBodyJsonParams(req.body, errors, [
      "sender",
      "recipients",
      "subject",
      "body",
    ])
  ) {
    res.status(400).send(errors);
    return;
  }

  const senderEMail = req.body["sender"]; //"egs-notify@nextechnology.xyz"(This is a default email)
  const recipientEmails = req.body["recipients"]; // your_verified_recipient_email(you can put several recipients)
  const emailSubject = req.body["subject"]; // example: "EGS Project | Notification Service"
  const emailBody = req.body["body"]; // example: <h2>Wecolcome to our Apointment Booking Service</h2>
  const attachments = req.body["attachments"]; // example: [{ "attachment_name": "pain.png", "attachment_data": base64encodeddata, "attachment_mime": "image/png" }]

  var mimemessage = require("mimemessage");
  let mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [],
  });

  mailContent.header("From", senderEMail);
  mailContent.header("To", recipientEmails);

  mailContent.header("Subject", emailSubject);

  var alternateEntity = mimemessage.factory({
    contentType: "multipart/alternate;charset=utf-8",
    body: [],
  });

  var plainEntity = mimemessage.factory({
    contentType: "text/html;charset=utf-8",
    body: emailBody,
  });

  alternateEntity.body.push(plainEntity);
  mailContent.body.push(alternateEntity);

  if (Array.isArray(attachments)) {
    for (a of attachments) {
      if (
        !checkBodyJsonParams(a, errors, [
          "attachment_data",
          "attachment_mime",
          "attachment_name",
        ])
      ) {
        res.status(400).send(errors);
        return;
      }

      let bufferObj = Buffer.from(a["attachment_data"], "base64");
      var attachmentEntity = mimemessage.factory({
        contentType: a["attachment_mime"],
        contentTransferEncoding: "base64",
        body: bufferObj.toString("base64"),
      });

      attachmentEntity.header(
        "Content-Disposition",
        `attachment ;filename=${a["attachment_name"]}`
      );

      mailContent.body.push(attachmentEntity);
    }
  }

  const command = new SendRawEmailCommand({
    Destinations: recipientEmails,
    Source: senderEMail,
    RawMessage: { Data: Buffer.from(mailContent.toString()) },
  });
  sesClient
    .send(command)
    .then((data) => {
      console.log("Email Id:", data.MessageId);
      console.log(`Email sent to ${recipientEmails}`);
      res.status(200).send("Ok");
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.Error);
    });
});

app.listen(port, () => {
  console.log(`Notification service listening at http://localhost:${port}`);
});
