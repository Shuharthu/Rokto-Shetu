/**
 * @file firebase.js
 * @description Client-side Firebase Modular SDK Adapter (v10) for Authentication & Custom Claims.
 * Supports Email/Password, Google OAuth popup, Phone SMS OTP, and offline mock fallback.
 */

// Config can be provided via window.__FIREBASE_CONFIG__ at runtime or via environment defaults
export const FIREBASE_CONFIG = window.__FIREBASE_CONFIG__ || {
  apiKey: "AIzaSyDummyDevKeyForRoktoSetuBangladesh2026",
  authDomain: "roktoshetu.firebaseapp.com",
  projectId: "roktoshetu",
  storageBucket: "roktoshetu.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

let firebaseApp = null;
let firebaseAuth = null;
let authModules = null;
let phoneConfirmationResult = null;
let recaptchaVerifier = null;
let isMockMode = false;

/**
 * Loads Firebase Modular SDK from official Google CDN.
 * Falls back to dev mock mode if network is offline or SDK fails to load.
 */
export async function initFirebase() {
  if (firebaseAuth) return { app: firebaseApp, auth: firebaseAuth, isMock: isMockMode };

  try {
    const [appMod, authMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js')
    ]);

    authModules = authMod;
    firebaseApp = appMod.initializeApp(FIREBASE_CONFIG);
    firebaseAuth = authMod.getAuth(firebaseApp);

    // If running against local Firebase Auth emulator
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && window.__USE_FIREBASE_EMULATOR__) {
      authMod.connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
      console.info('[RoktoSetu Firebase] Connected to local Auth Emulator at 127.0.0.1:9099');
    }

    isMockMode = false;
    return { app: firebaseApp, auth: firebaseAuth, isMock: false };
  } catch (err) {
    console.warn('[RoktoSetu Firebase] Live Firebase SDK unavailable or offline. Operating in fallback mock mode:', err.message);
    isMockMode = true;
    return { app: null, auth: null, isMock: true };
  }
}

/**
 * Sign in using Email and Password
 */
export async function signInWithEmail(email, password) {
  const { auth, isMock } = await initFirebase();
  if (isMock || !auth) {
    return {
      user: {
        uid: 'mock_uid_' + Math.random().toString(36).slice(2, 9),
        displayName: email.split('@')[0],
        email,
        role: 'donor',
        verificationStatus: 'verified'
      }
    };
  }

  try {
    const userCredential = await authModules.signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await userCredential.user.getIdTokenResult();
    return {
      user: {
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName || email.split('@')[0],
        email: userCredential.user.email,
        phoneNumber: userCredential.user.phoneNumber,
        photoURL: userCredential.user.photoURL,
        role: tokenResult.claims.role || 'donor',
        orgId: tokenResult.claims.orgId || null,
        verificationStatus: tokenResult.claims.verificationStatus || 'unverified'
      }
    };
  } catch (error) {
    // If account doesn't exist yet, attempt automatic registration for smooth onboarding
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const newCred = await authModules.createUserWithEmailAndPassword(auth, email, password);
        return {
          user: {
            uid: newCred.user.uid,
            displayName: email.split('@')[0],
            email: newCred.user.email,
            role: 'donor',
            verificationStatus: 'unverified'
          }
        };
      } catch (regError) {
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  const { auth, isMock } = await initFirebase();
  if (isMock || !auth) {
    return {
      user: {
        uid: 'google_mock_' + Math.random().toString(36).slice(2, 9),
        displayName: 'Google Verified User',
        email: 'user@gmail.com',
        role: 'donor',
        verificationStatus: 'verified'
      }
    };
  }

  const provider = new authModules.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  const userCredential = await authModules.signInWithPopup(auth, provider);
  const tokenResult = await userCredential.user.getIdTokenResult();
  return {
    user: {
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName || 'Google User',
      email: userCredential.user.email,
      photoURL: userCredential.user.photoURL,
      role: tokenResult.claims.role || 'donor',
      orgId: tokenResult.claims.orgId || null,
      verificationStatus: tokenResult.claims.verificationStatus || 'verified'
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
              verificationStatus: 'verified'
            }
          };
        }
        throw new Error('Invalid OTP code. For simulated mode, enter 123456.');
      }
    };
    return { confirmationResult: phoneConfirmationResult, isMock: true };
  }

  // Live Firebase Phone Auth
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
  let role = 'donor';
  let orgId = null;
  let verificationStatus = 'verified';

  if (user.getIdTokenResult) {
    const tokenResult = await user.getIdTokenResult();
    role = tokenResult.claims.role || 'donor';
    orgId = tokenResult.claims.orgId || null;
    verificationStatus = tokenResult.claims.verificationStatus || 'verified';
  }

  return {
    user: {
      uid: user.uid,
      displayName: user.displayName || 'Verified Donor (' + (user.phoneNumber || '').slice(-4) + ')',
      phoneNumber: user.phoneNumber,
      email: user.email,
      role,
      orgId,
      verificationStatus
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
  const { auth, isMock } = await initFirebase();
  if (isMock || !auth || !authModules) {
    return () => {};
  }

  return authModules.onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const tokenResult = await firebaseUser.getIdTokenResult();
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
        photoURL: firebaseUser.photoURL,
        role: tokenResult.claims.role || 'donor',
        orgId: tokenResult.claims.orgId || null,
        verificationStatus: tokenResult.claims.verificationStatus || 'unverified'
      });
    } else {
      callback(null);
    }
  });
}
