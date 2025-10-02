import React, { useState } from 'react';
import { addPatient } from '../../services/patient.service';
import { Patient } from '../../types';

const PatientForm: React.FC<{ patient?: Patient; onSuccess: () => void }> = ({ patient, onSuccess }) => {
    const [name, setName] = useState(patient ? patient.name : '');
    const [age, setAge] = useState(patient ? patient.age : '');
    const [medicalHistory, setMedicalHistory] = useState(patient ? patient.medicalHistory : '');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const newPatient: Patient = { name, age, medicalHistory };

        try {
            await addPatient(newPatient);
            onSuccess();
        } catch (err) {
            setError('Failed to save patient information. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{patient ? 'Edit Patient' : 'Add Patient'}</h2>
            {error && <p className="error">{error}</p>}
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Age:</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
            <div>
                <label>Medical History:</label>
                <textarea value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} required />
            </div>
            <button type="submit">{patient ? 'Update Patient' : 'Add Patient'}</button>
        </form>
    );
};

export default PatientForm;