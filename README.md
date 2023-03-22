# Notification Service

## Instruction to run this service

- 1 - Stay in folder notservice
- 2 - To test sms/email go to index file and set your phone number and your email address
- 3 - In the same folder run **node index.js**
- 4 - Type in you browser **http://localhost:3030/v1/notifications/sms** and see in your mobile the message.
- 5 - You can test using Postmain with JSON format as follow (POST method):
  http://localhost:3030/v1/notifications/sms

```
{
    "msg_body":"EGS SMS NOTIFY",
    "send_to":"+351xxxxxxxx"
}
```

http://localhost:3030/v1/notifications/email

```
{
    "to":"put here your registered email",
    "subject":"EGS Project | Notification Service",
    "text": "We notify you about your appointment Booking"
}

```
