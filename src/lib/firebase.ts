
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "nextplate-gkw5s",
  "appId": "1:881645093978:web:10fcadb8f654cdc12c0463",
  "storageBucket": "nextplate-gkw5s.firebasestorage.app",
  "apiKey": "AIzaSyC5TEKogLMwyuQ5dZEyBjtv1xJ1OkVQang",
  "authDomain": "nextplate-gkw5s.firebaseapp.com",
  "messagingSenderId": "881645093978"
};


let app: FirebaseApp;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
