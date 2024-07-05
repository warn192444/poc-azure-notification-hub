<template>
    <div id="app">
        <button @click="subscribeToNotifications">Enable Notifications</button>
    </div>
</template>

<script>
export default {
    name: 'App',
    methods: {
        async subscribeToNotifications() {
            const publicVapidKey = ''; //TODO:

            // Convert the VAPID key to a Uint8Array
            const urlBase64ToUint8Array = (base64String) => {
                const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
                const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);

                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            };

            if ('Notification' in window && 'serviceWorker' in navigator) {
                try {
                    console.log('Requesting notification permission...');
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        throw new Error('Permission not granted for Notification');
                    }

                    const registration = await navigator.serviceWorker.register('/sw.js');
                    let subscription = await registration.pushManager.getSubscription();
                    if (!subscription) {
                        const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
                        subscription = registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey,
                        });
                    }
                    console.log('Service Worker subscription:', subscription);

                    // Send subscription to your server to register it with Azure Notification Hub
                    await fetch('http://localhost:3000/register-sdk', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            endpoint: subscription.endpoint,
                            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
                            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
                        }),
                    });

                    console.log('Subscribed to push notifications:', subscription);
                } catch (error) {
                    console.error('Failed to subscribe to push notifications:', error);
                }
            } else {
                console.warn('Push messaging is not supported');
            }
        },
    },
};
</script>
