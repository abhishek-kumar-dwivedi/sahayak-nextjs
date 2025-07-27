# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Connecting to Firebase

This application requires a Firebase project to store data for workspaces, planner events, and more. To connect your app to a Firebase project, follow these steps:

1.  **Go to the Firebase Console:** Open [https://console.firebase.google.com/](https://console.firebase.google.com/) in your browser.

2.  **Create a Firebase Project:**
    *   Click on "**Add project**".
    *   Give your project a name (e.g., "Sahayak-App").
    *   Follow the on-screen steps to create the project. You can disable Google Analytics for this project if you wish.

3.  **Create a Web App:**
    *   Once your project is ready, you'll be on the project's overview page.
    *   Click the **Web** icon (it looks like `</>`) to add a web app to your project.
    *   Give your app a nickname (e.g., "Sahayak Web") and click "**Register app**".

4.  **Get Your Firebase Configuration:**
    *   After registering, Firebase will show you a `firebaseConfig` object. This object contains the keys your application needs to connect to your project.
    *   It will look something like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "AIza...",
          authDomain: "your-project-id.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project-id.appspot.com",
          messagingSenderId: "1234567890",
          appId: "1:1234567890:web:abcdef123456"
        };
        ```

5.  **Add Configuration to Your Code:**
    *   Copy the entire `firebaseConfig` object.
    *   In your code editor, open the file `src/lib/firebase.ts`.
    *   Paste your `firebaseConfig` object into this file, replacing the existing placeholder object.

6.  **Enable Firestore:**
    *   Back in the Firebase Console, go to the "**Build**" section in the left sidebar and click on "**Firestore Database**".
    *   Click "**Create database**".
    *   Choose to start in **test mode** for now. This will allow your app to read and write data without complex security rules.
    *   Select a location for your database and click "**Enable**".

Once you've completed these steps, your application will be fully connected to your own Firebase project and Firestore database.
