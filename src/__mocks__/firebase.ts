export const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
};

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
};

export const mockStorage = {
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: (...args) => mockAuth.signInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args) => mockAuth.createUserWithEmailAndPassword(...args),
  signOut: (...args) => mockAuth.signOut(...args),
  onAuthStateChanged: (...args) => mockAuth.onAuthStateChanged(...args)
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: (...args) => mockFirestore.collection(...args),
  doc: (...args) => mockFirestore.doc(...args),
  getDoc: (...args) => mockFirestore.getDoc(...args),
  getDocs: (...args) => mockFirestore.getDocs(...args),
  setDoc: (...args) => mockFirestore.setDoc(...args),
  updateDoc: (...args) => mockFirestore.updateDoc(...args),
  deleteDoc: (...args) => mockFirestore.deleteDoc(...args),
  query: (...args) => mockFirestore.query(...args),
  where: (...args) => mockFirestore.where(...args),
  orderBy: (...args) => mockFirestore.orderBy(...args),
  limit: (...args) => mockFirestore.limit(...args)
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => mockStorage),
  ref: (...args) => mockStorage.ref(...args),
  uploadBytes: (...args) => mockStorage.uploadBytes(...args),
  getDownloadURL: (...args) => mockStorage.getDownloadURL(...args),
  deleteObject: (...args) => mockStorage.deleteObject(...args)
}));