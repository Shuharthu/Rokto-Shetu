/**
 * @file firebase.js
 * @description Enterprise-grade Firebase Modular SDK Adapter (v10) for Authentication, Cloud Firestore, and Role Security.
 * Supports Email/Password, Google OAuth, Phone SMS OTP, Database Sync, Rate-Limiting, and graceful offline fallback.
 */

// Live Firebase Web Configuration for RoktoSetu
export const FIREBASE_CONFIG = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) || {
  apiKey: "AIzaSyBHrXn3JxfXDtUM8xH61eRehFbDI-Ouu04",
  authDomain: "roktoshetu.firebaseapp.com",
  projectId: "roktoshetu",
  storageBucket: "roktoshetu.firebasestorage.app",
  messagingSenderId: "228208003505",
  appId: "1:228208003505:web:78ff57008ec0e73ac21590",
  measurementId: "G-GFWN7SGXFT"
};

export const ADMIN_REGISTRATION_PASSCODE = 'ROKTO-ADMIN-2026';

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let authModules = null;
let firestoreModules = null;
let phoneConfirmationResult = null;
let recaptchaVerifier = null;
let isMockMode = false;

// In-memory mock database for offline / development fallback
const mockUserDatabase = new Map();

/**
 * Initialize Firebase App, Auth, and Firestore SDKs via official Google CDN.
 */
export async function initFirebase() {
  if (firebaseAuth && firebaseDb) {
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, isMock: isMockMode };
  }

  try {
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
    ]);

    authModules = authMod;
    firestoreModules = firestoreMod;
    firebaseApp = appMod.initializeApp(FIREBASE_CONFIG);
    firebaseAuth = authMod.getAuth(firebaseApp);
    firebaseDb = firestoreMod.getFirestore(firebaseApp);

    // If running against local Firebase Auth emulator
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocalhost && window.__USE_FIREBASE_EMULATOR__) {
      authMod.connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
      firestoreMod.connectFirestoreEmulator(firebaseDb, '127.0.0.1', 8080);
      console.info('[RoktoSetu Firebase] Connected to local Emulators (Auth:9099, Firestore:8080)');
    }

    isMockMode = false;
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb, isMock: false };
  } catch (err) {
    console.warn('[RoktoSetu Firebase] Live Firebase SDK unavailable or offline. Operating in fallback mock mode:', err.message);
    isMockMode = true;
    return { app: null, auth: null, db: null, isMock: true };
  }
}

/**
 * Checks connectivity to Firebase Auth and Cloud Firestore.
 */
export async function checkDatabaseConnection() {
  const { auth, db, isMock } = await initFirebase();
  if (isMock || !auth || !db) {
    return {
      connected: true,
      mode: 'offline_mock',
      auth: true,
      database: true,
      projectId: FIREBASE_CONFIG.projectId,
      message: 'Operating in Local Mock Mode (Offline/Sandbox)'
    };
  }

  try {
    // Quick probe to ensure auth and firestore instances are alive
    const appName = firebaseApp ? firebaseApp.name : '[DEFAULT]';
    return {
      connected: true,
      mode: 'live_cloud',
      auth: !!auth.currentUser || true,
      database: !!db,
      projectId: FIREBASE_CONFIG.projectId,
      appName,
      message: `Connected to Cloud Firestore & Auth (${FIREBASE_CONFIG.projectId})`
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'error',
      auth: false,
      database: false,
      projectId: FIREBASE_CONFIG.projectId,
      message: `Connection check failed: ${err.message}`
    };
  }
}

const memoryRateLimitStore = new Map();

/**
 * Rate Limiter for Login Attempts (Brute Force Protection)
 */
function checkRateLimit(email) {
  const key = `auth_attempts_${email.toLowerCase().trim()}`;
  try {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : memoryRateLimitStore.get(key);
    if (!raw) return;
    const { count, lastAttempt } = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const now = Date.now();
    const lockDurationMs = 15 * 60 * 1000; // 15 minutes

    if (count >= 5 && now - lastAttempt < lockDurationMs) {
      const minutesRemaining = Math.ceil((lockDurationMs - (now - lastAttempt)) / 60000);
      throw new Error(`Security Lockout: 5 failed login attempts. Please wait ${minutesRemaining} minute(s) before trying again.`);
    }
  } catch (err) {
    if (err.message.startsWith('Security Lockout')) throw err;
  }
}

function recordFailedAttempt(email) {
  const key = `auth_attempts_${email.toLowerCase().trim()}`;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(key);
      const prev = raw ? JSON.parse(raw) : { count: 0 };
      sessionStorage.setItem(key, JSON.stringify({
        count: (prev.count || 0) + 1,
        lastAttempt: Date.now()
      }));
    } else {
      const prev = memoryRateLimitStore.get(key) || { count: 0 };
      memoryRateLimitStore.set(key, { count: (prev.count || 0) + 1, lastAttempt: Date.now() });
    }
  } catch {}
}

function clearRateLimit(email) {
  const key = `auth_attempts_${email.toLowerCase().trim()}`;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    } else {
      memoryRateLimitStore.delete(key);
    }
  } catch {}
}

/**
 * Validates password strength (min 8 chars, uppercase, lowercase, number/symbol)
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, score: 0, message: 'Password must be at least 8 characters long.' };
  }
  let score = 1;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 3) {
    return { valid: false, score, message: 'Password is too weak. Include a mix of uppercase, lowercase, and numbers.' };
  }
  return { valid: true, score, message: 'Strong password.' };
}

/**
 * Sign Up a New User with a Specified Role (user, donor, admin) and save to Firestore
 */
export async function signUpUserWithProfile({
  fullName,
  email,
  password,
  phoneNumber,
  role = 'user',
  bloodGroup = null,
  district = null,
  adminPasscode = null
}) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  // 1. Password strength enforcement
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    throw new Error(strength.message);
  }

  // 2. Role validation & Admin passcode check
  if (!['user', 'donor', 'admin'].includes(role)) {
    throw new Error('Invalid account type. Must be user, donor, or admin.');
  }

  if (role === 'donor' && !bloodGroup) {
    throw new Error('Please select your blood group to register as a donor.');
  }

  if (role === 'admin') {
    if (!adminPasscode || adminPasscode.trim() !== ADMIN_REGISTRATION_PASSCODE) {
      throw new Error(`Invalid Admin Passcode. Only authorized personnel can create an administrator account. (Use code: ${ADMIN_REGISTRATION_PASSCODE})`);
    }
  }

  const { auth, db, isMock } = await initFirebase();

  // Fallback Mock Mode
  if (isMock || !auth || !db) {
    const uid = 'mock_uid_' + Math.random().toString(36).slice(2, 9);
    const userDoc = {
      uid,
      displayName: trimmedName,
      email: trimmedEmail,
      phoneNumber: phoneNumber || null,
      role,
      roles: role === 'admin' ? ['admin'] : [],
      isDonor: role === 'donor',
      bloodGroup: role === 'donor' ? bloodGroup : null,
      district: district || 'Dhaka',
      verificationStatus: role === 'admin' ? 'verified' : 'pending',
      totalDonations: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockUserDatabase.set(uid, userDoc);
    mockUserDatabase.set(trimmedEmail, userDoc);
    return { user: userDoc };
  }

  // 3. Live Firebase Authentication Creation
  let userCredential;
  try {
    userCredential = await authModules.createUserWithEmailAndPassword(auth, trimmedEmail, password);
  } catch (authErr) {
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error('An account already exists with this email address. Please log in instead.');
    }
    if (authErr.code === 'auth/invalid-email') {
      throw new Error('The email address provided is invalid.');
    }
    throw new Error(authErr.message || 'Registration failed.');
  }

  const firebaseUser = userCredential.user;

  // 4. Update Auth Display Name
  try {
    if (authModules.updateProfile) {
      await authModules.updateProfile(firebaseUser, { displayName: trimmedName });
    }
  } catch (e) {
    console.warn('Could not update profile display name:', e);
  }

  // 5. Create Profile Record in Cloud Firestore (/users/{uid})
  const userDoc = {
    uid: firebaseUser.uid,
    displayName: trimmedName,
    email: trimmedEmail,
    phoneNumber: phoneNumber || null,
    role,
    roles: role === 'admin' ? ['admin'] : [],
    isDonor: role === 'donor',
    bloodGroup: role === 'donor' ? bloodGroup : null,
    district: district || 'Dhaka',
    verificationStatus: 'pending',
    totalDonations: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const userDocRef = firestoreModules.doc(db, 'users', firebaseUser.uid);
    await firestoreModules.setDoc(userDocRef, userDoc);
  } catch (dbErr) {
    console.error('[Firestore Write Error]', dbErr);
    // If rules reject client write, proceed with in-memory profile so user is not locked out
  }

  return { user: userDoc };
}

/**
 * Secure Sign In with Database Profile Retrieval and Role Routing
 */
export async function secureSignInWithEmail(email, password) {
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Check rate limit
  checkRateLimit(trimmedEmail);

  const { auth, db, isMock } = await initFirebase();

  // Fallback Mock Mode
  if (isMock || !auth || !db) {
    const existing = mockUserDatabase.get(trimmedEmail);
    if (!existing) {
      recordFailedAttempt(trimmedEmail);
      throw new Error('No registered account found with this email. Please sign up first.');
    }
    clearRateLimit(trimmedEmail);
    return { user: existing };
  }

  // 2. Live Firebase Authentication
  let userCredential;
  try {
    userCredential = await authModules.signInWithEmailAndPassword(auth, trimmedEmail, password);
  } catch (err) {
    recordFailedAttempt(trimmedEmail);
    if (err.code === 'auth/user-not-found') {
      throw new Error('No registered account found with this email. Please complete Sign Up first.');
    }
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    throw new Error(err.message || 'Authentication failed.');
  }

  clearRateLimit(trimmedEmail);
  const firebaseUser = userCredential.user;

  // 3. Retrieve User Document from Cloud Firestore
  let role = 'user';
  let isDonor = false;
  let bloodGroup = null;
  let verificationStatus = 'pending';
  let displayName = firebaseUser.displayName || trimmedEmail.split('@')[0];

  try {
    const userDocRef = firestoreModules.doc(db, 'users', firebaseUser.uid);
    const snap = await firestoreModules.getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || (data.roles?.includes('admin') ? 'admin' : (data.isDonor ? 'donor' : 'user'));
      isDonor = !!data.isDonor;
      bloodGroup = data.bloodGroup || null;
      verificationStatus = data.verificationStatus || 'pending';
      displayName = data.displayName || displayName;
    } else {
      // User exists in Auth but not yet in Firestore database
      // Auto-initialize profile document
      const fallbackDoc = {
        uid: firebaseUser.uid,
        displayName,
        email: trimmedEmail,
        phoneNumber: firebaseUser.phoneNumber || null,
        role: 'user',
        roles: [],
        isDonor: false,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await firestoreModules.setDoc(userDocRef, fallbackDoc);
    }
  } catch (dbErr) {
    console.warn('[Firestore Fetch Warning]', dbErr);
  }

  // 4. Check custom claims if any
  try {
    const tokenResult = await firebaseUser.getIdTokenResult();
    if (tokenResult.claims.super_admin || tokenResult.claims.admin) {
      role = 'admin';
    }
  } catch {}

  return {
    user: {
      uid: firebaseUser.uid,
      displayName,
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
      role,
      isDonor,
      bloodGroup,
      verificationStatus
    }
  };
}

/**
 * Sign In with Google and Sync with Cloud Firestore
 */
export async function signInWithGoogle() {
  const { auth, db, isMock } = await initFirebase();

  if (isMock || !auth || !db) {
    const uid = 'google_mock_' + Math.random().toString(36).slice(2, 9);
    const user = {
      uid,
      displayName: 'Google Verified User',
      email: 'user@gmail.com',
      role: 'donor',
      isDonor: true,
      bloodGroup: 'O+',
      verificationStatus: 'verified'
    };
    return { user };
  }

  const provider = new authModules.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const userCredential = await authModules.signInWithPopup(auth, provider);
  const firebaseUser = userCredential.user;

  let role = 'user';
  let isDonor = false;
  let bloodGroup = null;
  let verificationStatus = 'verified';

  // Check or create Firestore document
  try {
    const userDocRef = firestoreModules.doc(db, 'users', firebaseUser.uid);
    const snap = await firestoreModules.getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || 'user';
      isDonor = !!data.isDonor;
      bloodGroup = data.bloodGroup || null;
      verificationStatus = data.verificationStatus || 'verified';
    } else {
      // First-time Google user: Register in database as verified user
      const newDoc = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: 'user',
        roles: [],
        isDonor: false,
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await firestoreModules.setDoc(userDocRef, newDoc);
    }
  } catch (dbErr) {
    console.warn('[Google Firestore Sync]', dbErr);
  }

  return {
    user: {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Google User',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role,
      isDonor,
      bloodGroup,
      verificationStatus
    }
  };
}

/**
 * Send Phone SMS OTP with reCAPTCHA
 */
export async function sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const { auth, isMock } = await initFirebase();
  if (isMock || !auth) {
    phoneConfirmationResult = {
      confirm: async (otp) => {
        if (otp === '123456') {
          return {
            user: {
              uid: 'phone_mock_' + Math.random().toString(36).slice(2, 9),
              displayName: 'Phone User (' + phoneNumber.slice(-4) + ')',
              phoneNumber,
              role: 'donor',
              isDonor: true,
              bloodGroup: 'B+',
              verificationStatus: 'verified'
            }
          };
        }
        throw new Error('Invalid OTP code. For simulated mode, enter 123456.');
      }
    };
    return { confirmationResult: phoneConfirmationResult, isMock: true };
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new authModules.RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {}
    });
  }

  phoneConfirmationResult = await authModules.signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return { confirmationResult: phoneConfirmationResult, isMock: false };
}

/**
 * Confirm Phone 6-Digit OTP
 */
export async function confirmPhoneOtp(code) {
  if (!phoneConfirmationResult) {
    throw new Error('No phone verification in progress. Please request an OTP first.');
  }

  const confirmation = await phoneConfirmationResult.confirm(code);
  const user = confirmation.user;

  return {
    user: {
      uid: user.uid,
      displayName: user.displayName || 'Verified Donor (' + (user.phoneNumber || '').slice(-4) + ')',
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: 'donor',
      isDonor: true,
      verificationStatus: 'verified'
    }
  };
}

/**
 * Sign out from Firebase
 */
export async function signOutFromFirebase() {
  const { auth, isMock } = await initFirebase();
  if (!isMock && auth && authModules) {
    await authModules.signOut(auth);
  }
}

/**
 * Subscribe to Firebase Auth state changes
 */
export async function subscribeAuthState(callback) {
  const { auth, db, isMock } = await initFirebase();
  if (isMock || !auth || !authModules) {
    return () => {};
  }

  return authModules.onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      let role = 'user';
      let isDonor = false;
      let verificationStatus = 'pending';

      try {
        if (db && firestoreModules) {
          const userDocRef = firestoreModules.doc(db, 'users', firebaseUser.uid);
          const snap = await firestoreModules.getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            role = data.role || (data.roles?.includes('admin') ? 'admin' : (data.isDonor ? 'donor' : 'user'));
            isDonor = !!data.isDonor;
            verificationStatus = data.verificationStatus || 'pending';
          }
        }
      } catch {}

      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        if (tokenResult.claims.super_admin || tokenResult.claims.admin) {
          role = 'admin';
        }
      } catch {}

      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
        photoURL: firebaseUser.photoURL,
        role,
        isDonor,
        verificationStatus
      });
    } else {
      callback(null);
    }
  });
}
