import { initializeApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.databaseURL);

let db: Database | null = null;

if (isFirebaseConfigured) {
  const app = initializeApp(config);
  db = getDatabase(app);
}

export { db };
