
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "tutorally-1ud48",
  "appId": "1:716370672295:web:86a774aed08a5c0bb0b982",
  "storageBucket": "tutorally-1ud48.firebasestorage.app",
  "apiKey": "AIzaSyACVwc10baIeUga2mk67AcxiXS7TS3bmVE",
  "authDomain": "tutorally-1ud48.firebaseapp.com",
  "messagingSenderId": "716370672295"
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
