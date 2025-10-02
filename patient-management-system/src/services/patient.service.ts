import { db } from './firebase';
import { Patient } from '../types';

const patientCollection = db.collection('patients');

export const getPatients = async (): Promise<Patient[]> => {
    const snapshot = await patientCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
    const doc = await patientCollection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Patient : null;
};

export const addPatient = async (patient: Patient): Promise<void> => {
    await patientCollection.add(patient);
};

export const updatePatient = async (id: string, patient: Patient): Promise<void> => {
    await patientCollection.doc(id).update(patient);
};

export const deletePatient = async (id: string): Promise<void> => {
    await patientCollection.doc(id).delete();
};