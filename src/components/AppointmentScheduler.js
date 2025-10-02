// components/AppointmentScheduler.js
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AppointmentScheduler = () => {
  const { user, userData } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    paciente_id: '',
    fecha_hora: '',
    observaciones: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointments
        let appointmentsQuery;
        if (userData?.rol === 'paciente') {
          // Paciente solo ve sus citas
          appointmentsQuery = query(
            collection(db, 'agenda'),
            where('paciente_id', '==', user.uid),
            orderBy('fecha_hora', 'desc')
          );
        } else {
          // Profesional/Admin ve las citas que les corresponden
          appointmentsQuery = query(
            collection(db, 'agenda'),
            where('profesional_id', '==', userData.uid),
            orderBy('fecha_hora', 'desc')
          );
        }

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAppointments(appointmentsData);

        // Fetch patients (only if professional/admin)
        if (userData?.rol !== 'paciente') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const appointmentData = {
        id: uuidv4(),
        paciente_id: newAppointment.paciente_id,
        profesional_id: userData.uid,
        fecha_hora: new Date(newAppointment.fecha_hora),
        observaciones: newAppointment.observaciones,
        estado: 'pendiente',
        fecha_creacion: new Date()
      };

      await addDoc(collection(db, 'agenda'), appointmentData);
      
      setSuccess('Cita agendada exitosamente');
      setShowForm(false);
      setNewAppointment({
        paciente_id: '',
        fecha_hora: '',
        observaciones: ''
      });

      // Refresh appointments
      window.location.reload();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Error al agendar la cita');
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.uid === patientId || p.id === patientId);
    return patient ? patient.nombre : 'Paciente no encontrado';
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'realizada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando agenda...</p>
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
                <Calendar className="h-5 w-5" />
                {userData?.rol === 'paciente' ? 'Mis Citas' : 'Agenda de Citas'}
              </CardTitle>
              <CardDescription>
                {userData?.rol === 'paciente' 
                  ? 'Sus próximas citas y historial' 
                  : 'Gestione las citas de sus pacientes'
                }
              </CardDescription>
            </div>
            {userData?.rol !== 'paciente' && (
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Form for new appointment */}
      {showForm && userData?.rol !== 'paciente' && (
        <Card>
          <CardHeader>
            <CardTitle>Agendar Nueva Cita</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <select
                  value={newAppointment.paciente_id}
                  onChange={(e) => setNewAppointment({ ...newAppointment, paciente_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="">Seleccione un paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.uid || patient.id}>
                      {patient.nombre} - {patient.rut}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora *
                </label>
                <Input
                  type="datetime-local"
                  value={newAppointment.fecha_hora}
                  onChange={(e) => setNewAppointment({ ...newAppointment, fecha_hora: e.target.value })}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={newAppointment.observaciones}
                  onChange={(e) => setNewAppointment({ ...newAppointment, observaciones: e.target.value })}
                  placeholder="Observaciones de la cita..."
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
                <Button type="submit">Agendar Cita</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay citas agendadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {formatDateTime(appointment.fecha_hora)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.estado)}`}>
                        {appointment.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    {userData?.rol !== 'paciente' && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Paciente: {getPatientName(appointment.paciente_id)}
                        </span>
                      </div>
                    )}
                    
                    {appointment.observaciones && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Observaciones:</span>
                        <p className="mt-1">{appointment.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;