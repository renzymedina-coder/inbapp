// components/ProgressTracking.js
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Activity } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ProgressTracking = () => {
  const { user, userData } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    paciente_id: '',
    movilidad: 5,
    fuerza: 5,
    dolor: 5,
    observaciones: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (userData?.rol === 'paciente') {
          // Paciente solo ve sus evaluaciones
          const evaluationsQuery = query(
            collection(db, 'atenciones'),
            where('paciente_id', '==', user.uid),
            orderBy('fecha', 'asc')
          );
          
          const evaluationsSnapshot = await getDocs(evaluationsQuery);
          const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setEvaluations(evaluationsData);
          setSelectedPatient(user.uid);
        } else {
          // Profesional/Admin ve sus pacientes
          let patientsQuery;
          if (userData?.rol === 'admin') {
            patientsQuery = query(collection(db, 'pacientes'));
          } else {
            patientsQuery = query(
              collection(db, 'pacientes'),
              where('profesional_id', '==', userData.uid)
            );
          }
          
          const patientsSnapshot = await getDocs(patientsQuery);
          const patientsData = patientsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setPatients(patientsData);
          
          if (patientsData.length > 0) {
            const firstPatientId = patientsData[0].uid || patientsData[0].id;
            setSelectedPatient(firstPatientId);
            await loadEvaluations(firstPatientId);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchData();
    }
  }, [user, userData]);

  const loadEvaluations = async (patientId) => {
    try {
      const evaluationsQuery = query(
        collection(db, 'atenciones'),
        where('paciente_id', '==', patientId),
        orderBy('fecha', 'asc')
      );
      
      const evaluationsSnapshot = await getDocs(evaluationsQuery);
      const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      setError('Error al cargar las evaluaciones');
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatient(patientId);
    setNewEvaluation({ ...newEvaluation, paciente_id: patientId });
    loadEvaluations(patientId);
  };

  const calculateRecoveryPercentage = (movilidad, fuerza, dolor) => {
    // Fórmula: ((movilidad + fuerza + (10 - dolor)) / 30) * 100
    // El dolor se invierte porque menor dolor = mejor
    const score = (movilidad + fuerza + (10 - dolor)) / 30 * 100;
    return Math.round(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const recoveryPercentage = calculateRecoveryPercentage(
        parseInt(newEvaluation.movilidad),
        parseInt(newEvaluation.fuerza),
        parseInt(newEvaluation.dolor)
      );

      const evaluationData = {
        id: uuidv4(),
        paciente_id: selectedPatient,
        profesional_id: userData.uid,
        fecha: new Date(),
        observaciones: newEvaluation.observaciones,
        parametros: {
          movilidad: parseInt(newEvaluation.movilidad),
          fuerza: parseInt(newEvaluation.fuerza),
          dolor: parseInt(newEvaluation.dolor)
        },
        porcentaje_recuperacion: recoveryPercentage
      };

      await addDoc(collection(db, 'atenciones'), evaluationData);
      
      setSuccess('Evaluación registrada exitosamente');
      setShowForm(false);
      setNewEvaluation({
        paciente_id: selectedPatient,
        movilidad: 5,
        fuerza: 5,
        dolor: 5,
        observaciones: ''
      });

      // Reload evaluations
      await loadEvaluations(selectedPatient);
    } catch (error) {
      console.error('Error creating evaluation:', error);
      setError('Error al registrar la evaluación');
    }
  };

  const formatChartData = () => {
    return evaluations.map((evaluation, index) => ({
      sesion: `Sesión ${index + 1}`,
      fecha: evaluation.fecha?.toDate ? 
        evaluation.fecha.toDate().toLocaleDateString('es-CL') : 
        new Date(evaluation.fecha).toLocaleDateString('es-CL'),
      recuperacion: evaluation.porcentaje_recuperacion,
      movilidad: evaluation.parametros?.movilidad || 0,
      fuerza: evaluation.parametros?.fuerza || 0,
      dolor: evaluation.parametros?.dolor || 0
    }));
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.uid === patientId || p.id === patientId);
    return patient ? patient.nombre : 'Paciente';
  };

  const getLatestRecovery = () => {
    if (evaluations.length === 0) return 0;
    return evaluations[evaluations.length - 1].porcentaje_recuperacion || 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando información...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {userData?.rol === 'paciente' ? 'Mi Evolución' : 'Evolución de Pacientes'}
              </CardTitle>
              <CardDescription>
                Seguimiento del progreso de recuperación a través del tiempo
              </CardDescription>
            </div>
            {userData?.rol !== 'paciente' && selectedPatient && (
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userData?.rol !== 'paciente' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Paciente
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="flex h-10 w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Seleccione un paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.uid || patient.id}>
                    {patient.nombre} - {patient.rut}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Evaluation Form */}
      {showForm && userData?.rol !== 'paciente' && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Evaluación</CardTitle>
            <CardDescription>
              Para: {getPatientName(selectedPatient)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movilidad (1-10)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEvaluation.movilidad}
                      onChange={(e) => setNewEvaluation({ ...newEvaluation, movilidad: e.target.value })}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-semibold text-blue-600">
                      {newEvaluation.movilidad}/10
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuerza (1-10)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEvaluation.fuerza}
                      onChange={(e) => setNewEvaluation({ ...newEvaluation, fuerza: e.target.value })}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-semibold text-green-600">
                      {newEvaluation.fuerza}/10
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dolor (1-10)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEvaluation.dolor}
                      onChange={(e) => setNewEvaluation({ ...newEvaluation, dolor: e.target.value })}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-semibold text-red-600">
                      {newEvaluation.dolor}/10
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Porcentaje de Recuperación Estimado</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateRecoveryPercentage(
                      parseInt(newEvaluation.movilidad),
                      parseInt(newEvaluation.fuerza),
                      parseInt(newEvaluation.dolor)
                    )}%
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={newEvaluation.observaciones}
                  onChange={(e) => setNewEvaluation({ ...newEvaluation, observaciones: e.target.value })}
                  placeholder="Observaciones sobre la evolución del paciente..."
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[80px]"
                  rows={3}
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

              <div className="flex gap-2">
                <Button type="submit">Registrar Evaluación</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Progress Chart */}
      {selectedPatient && evaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Evolución de la Recuperación
            </CardTitle>
            <CardDescription>
              Progreso actual: {getLatestRecovery()}% de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sesion" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'recuperacion') return [`${value}%`, 'Recuperación'];
                      return [value, name];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="recuperacion" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluations History */}
      {selectedPatient && evaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.slice(-5).reverse().map((evaluation, index) => (
                <div key={evaluation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">
                      {evaluation.fecha?.toDate ? 
                        evaluation.fecha.toDate().toLocaleDateString('es-CL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        new Date(evaluation.fecha).toLocaleDateString('es-CL')
                      }
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {evaluation.porcentaje_recuperacion}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Movilidad</div>
                      <div className="font-semibold text-blue-600">
                        {evaluation.parametros?.movilidad || 0}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Fuerza</div>
                      <div className="font-semibold text-green-600">
                        {evaluation.parametros?.fuerza || 0}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Dolor</div>
                      <div className="font-semibold text-red-600">
                        {evaluation.parametros?.dolor || 0}/10
                      </div>
                    </div>
                  </div>
                  
                  {evaluation.observaciones && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Observaciones:</span> {evaluation.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedPatient && evaluations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay evaluaciones registradas para este paciente</p>
            {userData?.rol !== 'paciente' && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                Registrar Primera Evaluación
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracking;