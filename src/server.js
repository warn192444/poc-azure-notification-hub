import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import { NotificationHubsClient, createBrowserInstallation } from '@azure/notification-hubs';

const app = express();

const AZURE_NOTIFICATION_HUB_NAME_SPACE = ''; //TODO:
const AZURE_NOTIFICATION_HUB_NAME = ''; //TODO:
const AZURE_NOTIFICATION_HUB_CONNECTION_STRING = ''; //TODO:

app.use(
    cors({
        origin: 'http://localhost:5173',
    })
);

app.use(express.json());

// app.post('/register', async (req, res) => {
//     const subscription = req.body;
//     // console.log('subscription =>', subscription);
//     const registrationId = uuid();

//     const registrationPayload = {
//         registrationId,
//         platform: 'webpush',
//         pushChannel: subscription.endpoint,
//         p256dh: subscription.p256dh,
//         auth: subscription.auth,
//     };

//     try {
//         const response = await axios.post(
//             `https://${AZURE_NOTIFICATION_HUB_NAME_SPACE}.servicebus.windows.net/${AZURE_NOTIFICATION_HUB_NAME}/registrations/?api-version=2015-01`,
//             registrationPayload,
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `SharedAccessSignature ${AZURE_NOTIFICATION_HUB_CONNECTION_STRING}`,
//                 },
//             }
//         );

//         console.log('response =>', response);

//         res.status(200).send(response.data);
//     } catch (error) {
//         console.log('error =>', error);
//         console.log('error =>', error.response.status, error.response.statusText);

//         res.status(500).send(error);
//     }
// });

app.post('/register-sdk', async (req, res) => {
    const subscription = req.body;
    const installationId = uuid();

    try {
        const client = new NotificationHubsClient(AZURE_NOTIFICATION_HUB_CONNECTION_STRING, AZURE_NOTIFICATION_HUB_NAME);

        const installation = createBrowserInstallation({
            installationId,
            platform: 'browser',
            pushChannel: {
                auth: subscription.auth,
                endpoint: subscription.endpoint,
                p256dh: subscription.p256dh,
            },
            tags: ['poc-web-push'],
        });
        console.log('installation =>', installation);

        const result = await client.createOrUpdateInstallation(installation);

        console.log('result =>', result);

        res.status(200).send(result);
    } catch (error) {
        console.log('error =>', error);

        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
