const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    data: data, // optional key-value pairs for additional data
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent message:', response);
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
}

// Example usage
const deviceToken = 'ExponentPushToken[LGMreLBT4XFWUDjUDtBJMc]'; // Replace with actual device token
sendPushNotification(
  deviceToken,
  '🚀 Test Notification',
  'This push notification was sent using Node.js and Firebase!',
  { key1: 'value1', key2: 'value2' }
);
