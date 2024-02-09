const { initializeApp } = require("firebase/app");

const firebaseConfig = {
    apiKey: process.env.PROJECT_API_KEY,
    authDomain: "coskitrip.firebaseapp.com",
    projectId: "coskitrip",
    storageBucket: "coskitrip.appspot.com",
    messagingSenderId: process.env.PROJECT_MESSAGING_SENDER_ID,
    appId: process.env.PROJECT_APP_ID
  };
const app = initializeApp(firebaseConfig);

