import { initializeApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

// Configuration loaded from the provided config
const firebaseConfig = {
  apiKey: "AIzaSyDf5D_52VFqAyDe5Z_8I7YH6S41YNia4Mc",
  authDomain: "khaki-drive-v07pf.firebaseapp.com",
  projectId: "khaki-drive-v07pf",
  storageBucket: "khaki-drive-v07pf.firebasestorage.app",
  messagingSenderId: "1073693804390",
  appId: "1:1073693804390:web:48fcb192885825f2976aa7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-177838ba-701f-499d-835c-5d2fbda9cfad");

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'school_admin';
  birthDate?: string;
  schoolName?: string;
  gradeClass?: string;
  country?: string;
  avatar?: string;
  xp: number;
  level: number;
  streakDays: number;
  hoursStudied: number;
  completionRate: number;
  completedLessons: string[]; // List of lesson IDs
  unlockedBadgeIds: string[]; // List of badge IDs
  password?: string; // Stored only for pre-provisioned accounts before first login
}

export const defaultProfile = (userId: string, email: string, name: string, role: 'student' | 'teacher' | 'school_admin' = 'student'): UserProfileData => ({
  id: userId,
  name: name || 'Học viên IC3',
  email: email,
  role: role,
  xp: 0,
  level: 1,
  streakDays: 1,
  hoursStudied: 0,
  completionRate: 0,
  completedLessons: [],
  unlockedBadgeIds: [],
  birthDate: '',
  schoolName: '',
  gradeClass: '',
  country: 'Vietnam',
  avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || userId)}`
});

// Helper to manage a fast local storage backup cache of user profiles
function getLocalProfilesCache(): UserProfileData[] {
  const saved = localStorage.getItem('ic3_local_profiles');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveLocalProfilesCache(profiles: UserProfileData[]) {
  localStorage.setItem('ic3_local_profiles', JSON.stringify(profiles));
}

/**
 * Fetch profiles from Firestore or initialize them with smart sub-millisecond local cache fallback
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  // First, check high-speed local cache
  const localList = getLocalProfilesCache();
  const cached = localList.find(p => p.id === userId);
  
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dbProfile = docSnap.data() as UserProfileData;
      const fullProfile = { ...dbProfile, id: userId };
      // Sync into local cache
      const updatedList = localList.filter(p => p.id !== userId);
      updatedList.push(fullProfile);
      saveLocalProfilesCache(updatedList);
      return fullProfile;
    }
  } catch (error) {
    console.warn("Firestore getUserProfile error, using cached data:", error);
  }
  
  return cached || null;
}

/**
 * Fetch profile by email from Firestore with instant local cache lookup as fallback/primary
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfileData | null> {
  const targetEmail = email.trim().toLowerCase();
  
  // High-speed local cache search first
  const localList = getLocalProfilesCache();
  const cached = localList.find(p => p.email.toLowerCase() === targetEmail);

  // 1. Try direct document lookup under /emails/{email}
  try {
    const emailRef = doc(db, 'emails', targetEmail);
    const emailSnap = await getDoc(emailRef);
    if (emailSnap.exists()) {
      const emailData = emailSnap.data();
      const userId = emailData.userId || emailData.id;
      if (userId) {
        const fullProfile = { id: userId, ...emailData } as UserProfileData;
        const updatedList = localList.filter(p => p.email.toLowerCase() !== targetEmail);
        updatedList.push(fullProfile);
        saveLocalProfilesCache(updatedList);
        return fullProfile;
      }
    }
  } catch (err) {
    console.warn("Direct emails index fetch did not resolve, continuing to general query lookup:", err);
  }

  // 2. Query fallback search
  try {
    const q = query(collection(db, 'users'), where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const dbProfile = { ...docSnap.data(), id: docSnap.id } as UserProfileData;
      
      // Update local cache
      const updatedList = localList.filter(p => p.email.toLowerCase() !== targetEmail);
      updatedList.push(dbProfile);
      saveLocalProfilesCache(updatedList);
      
      return dbProfile;
    }
  } catch (error) {
    console.warn("Firestore getUserProfileByEmail error, returning cached:", error);
  }

  return cached || null;
}

/**
 * Fetch all user profiles (overwrites local cache when Firestore is successful)
 */
export async function getAllUserProfiles(): Promise<UserProfileData[]> {
  const localList = getLocalProfilesCache();
  
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const dbList: UserProfileData[] = [];
    querySnapshot.forEach((docSnap) => {
      dbList.push({ ...docSnap.data(), id: docSnap.id } as UserProfileData);
    });

    // When connection is successful, database is the absolute source of truth
    saveLocalProfilesCache(dbList);
    return dbList;
  } catch (error) {
    console.warn("Firestore getAllUserProfiles error, falling back to local cache:", error);
    return localList;
  }
}

/**
 * Delete a user profile from both Firestore and local database cache
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  // Update local cache
  const localList = getLocalProfilesCache();
  const updatedList = localList.filter(p => p.id !== userId);
  saveLocalProfilesCache(updatedList);

  const docRef = doc(db, 'users', userId);
  await deleteDoc(docRef);
}

/**
 * Save / Update user profile in both local storage cache and remote Firestore
 */
export async function saveUserProfile(userId: string, profile: Partial<UserProfileData>): Promise<void> {
  // Update local cache immediately
  const localList = getLocalProfilesCache();
  const existingIndex = localList.findIndex(p => p.id === userId);
  
  let mergedProfile: UserProfileData;
  if (existingIndex > -1) {
    mergedProfile = { ...localList[existingIndex], ...profile } as UserProfileData;
    localList[existingIndex] = mergedProfile;
  } else {
    // Default fallback to keep types clean
    mergedProfile = {
      id: userId,
      name: profile.name || 'Học viên IC3',
      email: profile.email || '',
      role: profile.role || 'student',
      xp: profile.xp || 0,
      level: profile.level || 1,
      streakDays: profile.streakDays || 1,
      hoursStudied: profile.hoursStudied || 0,
      completionRate: profile.completionRate || 0,
      completedLessons: profile.completedLessons || [],
      unlockedBadgeIds: profile.unlockedBadgeIds || [],
      birthDate: profile.birthDate || '',
      schoolName: profile.schoolName || '',
      gradeClass: profile.gradeClass || '',
      country: profile.country || 'Vietnam',
      ...profile
    } as UserProfileData;
    localList.push(mergedProfile);
  }
  
  saveLocalProfilesCache(localList);

  // Background write to Firestore
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, mergedProfile, { merge: true });

    // Also write an active lookup mapping under the 'emails' collection for high-speed indexing
    if (mergedProfile.email) {
      const emailRef = doc(db, 'emails', mergedProfile.email.toLowerCase().trim());
      await setDoc(emailRef, { userId, ...mergedProfile }, { merge: true });
    }
  } catch (error) {
    console.warn("Background Firebase setDoc error, local cache remains up-to-date:", error);
  }
}

/**
 * Saves or updates a Class group in Firestore.
 */
export async function saveClassToDb(classId: string, classData: any): Promise<void> {
  try {
    const docRef = doc(db, 'classes', classId);
    let finalData = { ...classData, id: classId };
    
    // Ensure nested structures are clean
    await setDoc(docRef, finalData, { merge: true });
    
    // Also save a code lookup document for high speed queries
    if (classData.code) {
      const codeRef = doc(db, 'classCodes', classData.code.toUpperCase().trim());
      await setDoc(codeRef, { classId, ...classData }, { merge: true });
    }
  } catch (error) {
    console.warn("Background Firebase saveClassToDb error:", error);
  }
}

/**
 * Deletes a Class group from Firestore.
 */
export async function deleteClassFromDb(classId: string, code?: string): Promise<void> {
  try {
    const docRef = doc(db, 'classes', classId);
    await deleteDoc(docRef);
    if (code) {
      const codeRef = doc(db, 'classCodes', code.toUpperCase().trim());
      await deleteDoc(codeRef);
    }
  } catch (error) {
    console.warn("Firebase deleteClassFromDb error:", error);
  }
}

/**
 * Retrieves a class by its code from Firestore.
 */
export async function getClassByCodeFromDb(code: string): Promise<any | null> {
  try {
    const codeRef = doc(db, 'classCodes', code.toUpperCase().trim());
    const docSnap = await getDoc(codeRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // Fallback: search classes collection if direct code lookup is missing
    const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase().trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (error) {
    console.warn("Firebase getClassByCodeFromDb error:", error);
  }
  return null;
}

/**
 * Retrieves all classes for a given teacher.
 */
export async function getClassesByTeacherFromDb(teacherId: string): Promise<any[]> {
  const list: any[] = [];
  try {
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
  } catch (error) {
    console.warn("Firebase getClassesByTeacherFromDb error:", error);
  }
  return list;
}

/**
 * Retrieves all classes from Firestore.
 */
export async function getAllClassesFromDb(): Promise<any[]> {
  const list: any[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'classes'));
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
  } catch (error) {
    console.warn("Firebase getAllClassesFromDb error:", error);
  }
  return list;
}

/**
 * Creates a real Firebase Auth user without signing out the current user session.
 * Utilizes a secondary named Firebase App instance.
 */
export async function adminCreateUser(email: string, password: string): Promise<string> {
  const tempAppName = 'TempAuthApp_' + Math.random().toString(36).substring(2, 10);
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);
  
  try {
    const credential = await createUserWithEmailAndPassword(tempAuth, email.trim().toLowerCase(), password);
    const uid = credential.user.uid;
    // Sign out from the temporary instance immediately
    await signOut(tempAuth);
    await deleteApp(tempApp);
    return uid;
  } catch (error) {
    try {
      await deleteApp(tempApp);
    } catch (e) {
      console.error("Error closing temp auth app:", e);
    }
    throw error;
  }
}

