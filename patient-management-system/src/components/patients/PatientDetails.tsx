import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPatientDetails } from '../../services/patient.service';
import { Patient } from '../../types';

const PatientDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const data = await getPatientDetails(id);
                setPatient(data);
            } catch (err) {
                setError('Failed to fetch patient details');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientDetails();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!patient) {
        return <div>No patient found</div>;
    }

    return (
        <div>
            <h2>Patient Details</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Medical History:</strong> {patient.medicalHistory}</p>
            <p><strong>Treatments:</strong> {patient.treatments.join(', ')}</p>
        </div>
    );
};

export default PatientDetails;