// src/services/firestore.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';

// A generic function to seed data if a collection is empty
export async function seedCollection(collectionName: string, data: any[]) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        console.log(`Seeding '${collectionName}' collection...`);
        const promises = data.map(item => {
            // If item has an ID, use it. Otherwise, let Firestore generate one.
            if(item.id) {
                return setDoc(doc(db, collectionName, item.id.toString()), item)
            }
            return addDoc(collectionRef, item);
        });
        await Promise.all(promises);
        console.log(`Seeding for '${collectionName}' complete.`);
    } else {
        console.log(`'${collectionName}' collection already has data. Skipping seed.`);
    }
}

// Workspace Services
export const getWorkspaces = async () => {
    const q = query(collection(db, "workspaces"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const updateWorkspaces = async (workspaces: any[]) => {
    const batch = workspaces.map(ws => {
        const docRef = doc(db, 'workspaces', ws.id || ws.grade.replace(/\s+/g, '_')); // Use existing id or generate one
        return setDoc(docRef, ws, { merge: true });
    });
    await Promise.all(batch);
}


// Event Services
export const getEvents = async () => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
};

export const addEvent = async (event: any) => {
    const newEventRef = await addDoc(collection(db, "events"), event);
    return newEventRef.id;
}

export const deleteEvent = async (eventId: string) => {
    await deleteDoc(doc(db, "events", eventId));
}


// Content History Services
export const getContentHistory = async () => {
    const q = query(collection(db, "generated_content"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
};

export const addContentHistory = async (content: any) => {
    const newContentRef = await addDoc(collection(db, "generated_content"), content);
    return newContentRef.id;
};

export const deleteContentHistory = async (contentId: string) => {
     await deleteDoc(doc(db, "generated_content", contentId));
}

// Knowledge Base Services
export const getKnowledgeFiles = async () => {
    const snapshot = await getDocs(collection(db, "knowledge_base"));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
};

export const addKnowledgeFile = async (file: any) => {
    const newFileRef = await addDoc(collection(db, "knowledge_base"), file);
    return newFileRef.id;
};

export const deleteKnowledgeFile = async (fileId: string) => {
    await deleteDoc(doc(db, "knowledge_base", fileId));
};

// Dashboard Data Services
export const getLessons = async () => {
    const snapshot = await getDocs(collection(db, "lessons"));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const getProgressData = async () => {
    const snapshot = await getDocs(collection(db, "progress"));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};
