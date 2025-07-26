
'use server';

// NOTE: This file is mostly disabled because authentication is currently
// bypassed with a hardcoded user in `src/context/auth-context.tsx`.

// The signOut function is kept for potential future use but is not currently
// called from anywhere in the application.
export async function signOut() {
  try {
    // In a real scenario, you would call firebaseSignOut(auth) here.
    return { success: true, message: 'Success! User would be logged out.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// The handleGoogleSignIn function is no longer needed as there is no
// sign-in process with a hardcoded user.
export async function handleGoogleSignIn(user: any) {
  return { success: true, message: 'Sign-in is currently bypassed.' };
}
