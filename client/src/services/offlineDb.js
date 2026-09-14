import { openDB } from 'idb';

const DB_NAME = 'skillhub-offline';
const DB_VERSION = 1;

let dbPromise;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('courseLists')) {
          db.createObjectStore('courseLists'); // key: query string, value: { courses, cachedAt }
        }
        if (!db.objectStoreNames.contains('resume')) {
          db.createObjectStore('resume'); // key: 'draft', value: resume object
        }
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

// ---- Courses ----
export async function cacheCourseList(key, courses) {
  const db = await getDB();
  await db.put('courseLists', { courses, cachedAt: Date.now() }, key);
  const tx = db.transaction('courses', 'readwrite');
  await Promise.all(courses.map((c) => tx.store.put(c)));
  await tx.done;
}

export async function getCachedCourseList(key) {
  const db = await getDB();
  return db.get('courseLists', key);
}

export async function cacheCourse(course) {
  const db = await getDB();
  await db.put('courses', course);
}

export async function getCachedCourse(id) {
  const db = await getDB();
  return db.get('courses', id);
}

export async function getAllCachedCourses() {
  const db = await getDB();
  return db.getAll('courses');
}

// ---- Resume draft (for offline editing) ----
export async function saveResumeDraft(resume) {
  const db = await getDB();
  await db.put('resume', resume, 'draft');
}

export async function getResumeDraft() {
  const db = await getDB();
  return db.get('resume', 'draft');
}

// ---- Pending sync queue (resume edits made while offline) ----
export async function queuePendingSync(payload) {
  const db = await getDB();
  await db.add('pendingSync', { payload, createdAt: Date.now() });
}

export async function getPendingSyncItems() {
  const db = await getDB();
  return db.getAll('pendingSync');
}

export async function clearPendingSyncItem(id) {
  const db = await getDB();
  await db.delete('pendingSync', id);
}

export async function clearAllPendingSync() {
  const db = await getDB();
  await db.clear('pendingSync');
}
