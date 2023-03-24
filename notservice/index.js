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
  const message = req.body["message"];
  const phoneNumber = req.body["sendTo"];

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
    })
    .catch((error) => {
      console.error(error);
    });
});

//send e-mail message with AWS SES

app.post("/v1/notifications/email", (req, res) => {
  const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

  const { Readable } = require("stream");
  const { createReadStream } = require("fs");

  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const senderEMail = req.body["sender"]; //"egs-notify@nextechnology.xyz"(This is a default email)
  const recipientEmail = req.body["recipient"]; // your_verified_recipient_email(you can put several recipients)
  const emailSubject = req.body["subject"]; // example: "EGS Project | Notification Service"
  const emailBody = req.body["body"]; // example: <h2>Wecolcome to our Apointment Booking Service</h2>
  const attachmentName = req.body["attachment_name"]; // example: "file.txt"
  const attachmentData = req.body["attachment_data"]; // example: "something"

  // Create an Attachment object with the content and filename
  const attachmentStream = new Readable();
  attachmentStream.push(Buffer.from(attachmentData, "base64"));
  attachmentStream.push(null);

  const params = {
    Destination: {
      ToAddresses: [recipientEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: emailSubject,
      },
    },
    Source: senderEMail,
  };

  // Add the attachment to the email if it's present
  if (attachmentData) {
    const attachment = {
      filename: attachmentName,
      content: attachmentStream,
    };
    params.Message.Body.Attachments = [attachment];
  }
  const command = new SendEmailCommand(params);
  sesClient
    .send(command)
    .then((data) => {
      console.log("Email Id:", data.MessageId);
      console.log(`Email sent to ${params.Destination.ToAddresses}`);
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`Notification service listening at http://localhost:${port}`);
});
