# WhatsApp API

This is a simple implementation of the [@WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) library for interacting with WhatsApp through a RESTful API. This README provides instructions on how to set up and use the API.

## How to Run

To get started, follow these steps:

1. Install the required dependencies:

   ```bash
   npm install
   ```

2. Start the API server:

   ```bash
   npm run start
   ```

## How to Create a Session

To use the WhatsApp API, you'll need to create a session. Use the following `curl` command to create a session:

```bash
curl --location --request POST 'localhost:3000/sessions/:sessionId' \
--header 'x-api-key: YOUR_API_KEY'
```

Replace `:sessionId` with a unique session identifier and `YOUR_API_KEY` with your actual API key.

## How to Check Session Status

You can check the status of a session using the following `curl` command:

```bash
curl --location 'localhost:3000/sessions/:sessionId' \
--header 'x-api-key: YOUR_API_KEY'
```

Replace `:sessionId` with the session you want to check and `YOUR_API_KEY` with your actual API key.

## How to Logout a Session

To log out of a session, use the following `curl` command:

```bash
curl --location --request POST 'localhost:3000/sessions/:sessionId/logout' \
--header 'x-api-key: YOUR_API_KEY'
```

Replace `:sessionId` with the session you want to log out of and `YOUR_API_KEY` with your actual API key.

## How to Send a Text Message

You can send a text message using the API with the following `curl` command:

```bash
curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER",
    "message": "YOUR_MESSAGE"
}'
```

Replace `YOUR_SESSION_ID` with the session you want to send the message from, `YOUR_TARGET_RECEIVER` with the recipient's identifier, and `YOUR_MESSAGE` with the actual message content.

## How to Send Bulk Text Messages

To send bulk text messages, you can use the following `curl` command:

```bash
curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER_1|YOUR_TARGET_RECEIVER_2",
    "message": "YOUR_MESSAGE"
}'
```

Replace `YOUR_SESSION_ID` with the session you want to send the messages from, `YOUR_TARGET_RECEIVER_1|YOUR_TARGET_RECEIVER_2` with a pipe-separated list of target receivers, and `YOUR_MESSAGE` with the actual message content.

## How to Send Media Messages

To send media messages, use the following `curl` command:

```bash
curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER_1",
    "message": "YOUR_MESSAGE",
    "file" : "YOUR_MEDIA_PUBLIC_URL"
}'
```

Replace `YOUR_SESSION_ID` with the session you want to send the media from, `YOUR_TARGET_RECEIVER_1` with the recipient's identifier, `YOUR_MESSAGE` with the actual message content, and `YOUR_MEDIA_PUBLIC_URL` with the public URL of the media file you want to send.

Feel free to explore and integrate this WhatsApp API into your applications for automated messaging and interaction with WhatsApp. Make sure to keep your API key secure and follow WhatsApp's terms of service and guidelines when using this API.

