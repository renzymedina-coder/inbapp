import React, { useEffect, useState } from 'react';
import { getPatients } from '../../services/patient.service';
import { Patient } from '../../types';

const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await getPatients();
                setPatients(data);
            } catch (err) {
                setError('Failed to fetch patients');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Patient List</h2>
            <ul>
                {patients.map(patient => (
                    <li key={patient.id}>{patient.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PatientList;