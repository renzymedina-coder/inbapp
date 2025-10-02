import firebase from './firebase';

const auth = firebase.auth();

export const login = async (email: string, password: string) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const register = async (email: string, password: string) => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logout = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const onAuthStateChanged = (callback: (user: firebase.User | null) => void) => {
    return auth.onAuthStateChanged(callback);
};