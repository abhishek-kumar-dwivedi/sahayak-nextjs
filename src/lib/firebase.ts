
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { seedCollection } from '@/services/firestore';
import initialWorkspaces from '@/data/workspaces.json';
import initialEvents from '@/data/events.json';
import initialKnowledgeBase from '@/data/knowledge-base.json';
import initialLessons from '@/data/lessons.json';
import initialProgress from '@/data/progress.json';
import initialGeneratedContent from '@/data/generated-content.json';

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


// Seeding logic
async function seedAllData() {
    try {
        await seedCollection('workspaces', initialWorkspaces.map(w => ({...w, id: w.grade.replace(/\s+/g, '_')})));
        await seedCollection('events', initialEvents);
        await seedCollection('knowledge_base', initialKnowledgeBase);
        await seedCollection('lessons', initialLessons);
        await seedCollection('progress', initialProgress);
        await seedCollection('generated_content', initialGeneratedContent);
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}

// Call seeding on initial load. In a real app, this might be a separate setup script.
if(typeof window !== 'undefined') {
    // Run only on client side
    seedAllData();
}


export { app, auth, db };
