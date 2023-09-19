# whatsapp-api


Simple implementation of @WhiskeySockets/Baileys

How To Run?

- npm install
- npm run start

How To Create Session?

curl --location --request POST 'localhost:3000/sessions/:sessionId' \
--header 'x-api-key: YOUR_API_KEY'

How To Check Session Status?

curl --location 'localhost:3000/sessions/:sessionId' \
--header 'x-api-key: YOUR_API_KEY'

How To Logout Session ?

curl --location --request POST 'localhost:3000/sessions/:sessionId/logout' \
--header 'x-api-key: YOUR_API_KEY'

How To Send Text Message ?

curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER",
    "message": "YOUR_MESSAGE"
}'

How To Send Bulk Text Message ?

curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER_1|YOUR_TARGET_RECEIVER_2",
    "message": "YOUR_MESSAGE"
}'

How To Send Media Message?

curl --location 'localhost:3000/send' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY' \
--data '{
    "sender": "YOUR_SESSION_ID",
    "receiver": "YOUR_TARGET_RECEIVER_1",
    "message": "YOUR_MESSAGE",
    "file" : "YOUR_MEDIA_PUBLIC_URL"
}'