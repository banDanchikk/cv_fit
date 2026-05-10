import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBYS6CxQdfFOjUeW3kj78cZGEZLj2KCAH4",
  authDomain: "cvfit-be28f.firebaseapp.com",
  projectId: "cvfit-be28f",
  storageBucket: "cvfit-be28f.firebasestorage.app",
  messagingSenderId: "75479400411",
  appId: "1:75479400411:web:214cfce68782da7069f1fe",
  measurementId: "G-59WNYN7BPD"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
}