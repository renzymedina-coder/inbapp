// components/PatientList.js
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, Phone, Mail } from 'lucide-react';

const PatientList = () => {
  const { userData } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        let patientsQuery;
        
        if (userData?.rol === 'admin') {
          // Admin puede ver todos los pacientes
          patientsQuery = query(
            collection(db, 'pacientes'),
            orderBy('fecha_registro', 'desc')
          );
        } else if (userData?.rol === 'profesional') {
          // Profesional solo ve sus pacientes
          patientsQuery = query(
            collection(db, 'pacientes'),
            where('profesional_id', '==', userData.uid),
            orderBy('fecha_registro', 'desc')
          );
        } else {
          // Pacientes no deberían acceder a esta vista
          setError('No tienes permisos para ver esta información');
          return;
        }

        const querySnapshot = await getDocs(patientsQuery);
        const patientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchPatients();
    }
  }, [userData]);

  const filteredPatients = patients.filter(patient => 
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.rut.includes(searchTerm) ||
    patient.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando pacientes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lista de Pacientes
          </CardTitle>
          <CardDescription>
            {userData?.rol === 'admin' ? 'Todos los pacientes del sistema' : 'Sus pacientes registrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nombre, RUT o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda' : 'No hay pacientes registrados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{patient.nombre}</CardTitle>
                <CardDescription>{patient.rut}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {patient.correo}
                </div>
                {patient.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.telefono}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Edad:</span> {patient.edad} años
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sexo:</span> {patient.sexo === 'M' ? 'Masculino' : patient.sexo === 'F' ? 'Femenino' : 'Otro'}
                </div>
                {patient.diagnosticos && patient.diagnosticos.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Diagnósticos:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.diagnosticos.map((diag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {diag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patient.antecedentes && (
                  <div className="text-sm">
                    <span className="font-medium">Antecedentes:</span>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{patient.antecedentes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;