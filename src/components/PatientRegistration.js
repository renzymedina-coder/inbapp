// components/PatientRegistration.js
import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { validateRut, formatRut, getLastFourDigits } from '../utils/rutValidation';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const PatientRegistration = () => {
  const { userData } = useAuth();
  const [patient, setPatient] = useState({
    rut: '',
    nombre: '',
    edad: '',
    sexo: 'M',
    correo: '',
    telefono: '',
    direccion: '',
    antecedentes: '',
    diagnosticos: '',
    tratamientos: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleRutChange = (e) => {
    const value = e.target.value;
    const formattedRut = formatRut(value);
    setPatient({ ...patient, rut: formattedRut });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validar RUT
    if (!validateRut(patient.rut)) {
      setError('El RUT ingresado no es válido');
      setLoading(false);
      return;
    }

    try {
      const patientId = uuidv4();
      const password = getLastFourDigits(patient.rut);

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        patient.correo,
        password
      );

      const firebaseUser = userCredential.user;

      // Crear documento en colección 'users'
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        rut: patient.rut,
        nombre: patient.nombre,
        correo: patient.correo,
        telefono: patient.telefono,
        direccion: patient.direccion,
        rol: 'paciente',
        activo: true,
        fecha_creacion: new Date()
      });

      // Crear documento en colección 'pacientes'
      await setDoc(doc(db, 'pacientes', firebaseUser.uid), {
        uid: firebaseUser.uid,
        rut: patient.rut,
        nombre: patient.nombre,
        edad: parseInt(patient.edad),
        sexo: patient.sexo,
        correo: patient.correo,
        telefono: patient.telefono,
        direccion: patient.direccion,
        antecedentes: patient.antecedentes,
        diagnosticos: patient.diagnosticos.split(',').map(d => d.trim()).filter(d => d),
        tratamientos: patient.tratamientos.split(',').map(t => t.trim()).filter(t => t),
        profesional_id: userData?.uid,
        fecha_registro: new Date()
      });

      setSuccess(`Paciente registrado exitosamente. Contraseña generada: ${password}`);
      
      // Limpiar formulario
      setPatient({
        rut: '',
        nombre: '',
        edad: '',
        sexo: 'M',
        correo: '',
        telefono: '',
        direccion: '',
        antecedentes: '',
        diagnosticos: '',
        tratamientos: ''
      });
    } catch (error) {
      console.error('Error registering patient:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil');
      } else {
        setError('Error al registrar paciente: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nuevo Paciente</CardTitle>
        <CardDescription>
          Complete la información del paciente. Se creará automáticamente una cuenta con el email ingresado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT *
              </label>
              <Input
                type="text"
                value={patient.rut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <Input
                type="text"
                value={patient.nombre}
                onChange={(e) => setPatient({ ...patient, nombre: e.target.value })}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad *
              </label>
              <Input
                type="number"
                value={patient.edad}
                onChange={(e) => setPatient({ ...patient, edad: e.target.value })}
                placeholder="25"
                min="1"
                max="120"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <select
                value={patient.sexo}
                onChange={(e) => setPatient({ ...patient, sexo: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <Input
                type="email"
                value={patient.correo}
                onChange={(e) => setPatient({ ...patient, correo: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                type="tel"
                value={patient.telefono}
                onChange={(e) => setPatient({ ...patient, telefono: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <Input
              type="text"
              value={patient.direccion}
              onChange={(e) => setPatient({ ...patient, direccion: e.target.value })}
              placeholder="Calle 123, Comuna, Ciudad"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedentes Médicos
            </label>
            <textarea
              value={patient.antecedentes}
              onChange={(e) => setPatient({ ...patient, antecedentes: e.target.value })}
              placeholder="Describa antecedentes médicos relevantes..."
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[80px]"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnósticos (separados por comas)
            </label>
            <Input
              type="text"
              value={patient.diagnosticos}
              onChange={(e) => setPatient({ ...patient, diagnosticos: e.target.value })}
              placeholder="Lumbalgia, Cervicalgia, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamientos (separados por comas)
            </label>
            <Input
              type="text"
              value={patient.tratamientos}
              onChange={(e) => setPatient({ ...patient, tratamientos: e.target.value })}
              placeholder="Fisioterapia, Ejercicios, etc."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Registrando...' : 'Registrar Paciente'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientRegistration;