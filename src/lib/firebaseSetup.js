// lib/firebaseSetup.js
// This file contains initial setup functions for Firebase
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Function to create initial admin user (for development/testing)
export const createInitialAdmin = async () => {
  try {
    const adminEmail = 'admin@kinesio.cl';
    const adminPassword = 'admin123'; // Change this in production
    
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    
    const user = userCredential.user;
    
    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      rut: '12345678-9',
      nombre: 'Administrador Sistema',
      correo: adminEmail,
      telefono: '+56912345678',
      direccion: 'Dirección Admin',
      rol: 'admin',
      activo: true,
      fecha_creacion: new Date()
    });
    
    console.log('Admin user created successfully');
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Function to create initial professional user
export const createInitialProfessional = async () => {
  try {
    const professionalEmail = 'profesional@kinesio.cl';
    const professionalPassword = 'prof123'; // Change this in production
    
    // Create professional user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      professionalEmail,
      professionalPassword
    );
    
    const user = userCredential.user;
    
    // Create professional user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      rut: '98765432-1',
      nombre: 'Dr. Juan Pérez',
      correo: professionalEmail,
      telefono: '+56987654321',
      direccion: 'Consulta Médica 123',
      rol: 'profesional',
      activo: true,
      fecha_creacion: new Date()
    });
    
    console.log('Professional user created successfully');
    return user;
  } catch (error) {
    console.error('Error creating professional user:', error);
    throw error;
  }
};