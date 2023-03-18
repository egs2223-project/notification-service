// fetch('http://localhost:3030/v1/notifications/sms', {
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ "phone_number": "+351xxxxxxxxx", "msg_body": "Hello" })
// })
// .then(response => response.json())
// .then(response => console.log(JSON.stringify(response)))

// fetch('http://localhost:3030/v1/notifications/email', {
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ "send_to": "test@test.com", "subject": "Test Subject", "text": "Text", "html": "Html", "attachments": [
//         {
//           content: "asas".toString("base64"),
//           filename: "attachment.pdf",
//           type: "application/pdf",
//         }
//       ] })
// })
// .then(response => response.json())
// .then(response => console.log(JSON.stringify(response)))
