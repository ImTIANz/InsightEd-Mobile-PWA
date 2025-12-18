// src/db.js
import { openDB } from 'idb';

const DB_NAME = 'InsightEd_Outbox';
const STORE_NAME = 'pending_requests';

// 1. Initialize the Database
export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create a store that uses an auto-incrementing ID
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// 2. Save a Request to the Outbox (Offline Mode)
export async function addToOutbox(requestData) {
  const db = await initDB();
  // requestData will contain: { url, method, body, uid }
  return db.add(STORE_NAME, {
    ...requestData,
    timestamp: new Date().toISOString(),
    status: 'pending' 
  });
}

// 3. Get All Pending Requests (For the Sync Page)
export async function getOutbox() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

// 4. Delete a Request (After successful sync)
export async function deleteFromOutbox(id) {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
}