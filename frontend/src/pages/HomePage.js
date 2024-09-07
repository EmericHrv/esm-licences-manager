'use client';

import React, { useEffect, useState } from 'react';
import PersonTable from '../components/PersonTable';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import ErrorMessage from '../components/ErrorMessage';
import Notification from '../components/Notification';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const HomePage = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statsDataESM, setStatsDataESM] = useState({
        personsCount: 0,
        licencesCount: 0,
        licencesNonPayeesCount: 0,
        produitsRemisCount: 0,
    });
    const [statsDataGJ, setStatsDataGJ] = useState({
        personsCount: 0,
        licencesCount: 0,
        licencesNonPayeesCount: 0,
        produitsRemisCount: 0,
    });
    const [personError, setPersonError] = useState('');
    const [statsError, setStatsError] = useState('');
    const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch persons data
            const responsePersons = await fetch(`${API_BASE_URL}/persons`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (responsePersons.ok) {
                const dataPersons = await responsePersons.json();
                dataPersons.sort((a, b) => {
                    if (a.nom < b.nom) return -1;
                    if (a.nom > b.nom) return 1;
                    if (a.prenom < b.prenom) return -1;
                    if (a.prenom > b.prenom) return 1;
                    return 0;
                });
                setData(dataPersons);
                setFilteredData(dataPersons);
                setPersonError('');
            } else {
                setPersonError('Échec de la récupération des données des personnes');
            }

            // Fetch stats data
            const responseStatsESM = await fetch(`${API_BASE_URL}/persons/stats/ESM`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseStatsGJ = await fetch(`${API_BASE_URL}/persons/stats/GJ`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (responseStatsESM.ok && responseStatsGJ.ok) {
                const dataStatsESM = await responseStatsESM.json();
                const dataStatsGJ = await responseStatsGJ.json();
                setStatsDataESM(dataStatsESM);
                setStatsDataGJ(dataStatsGJ);
                setStatsError('');
            } else {
                setStatsError('Échec de la récupération des données statistiques');
            }
        } catch (error) {
            setPersonError('Une erreur est survenue lors de la récupération des données des personnes');
            setStatsError('Une erreur est survenue lors de la récupération des données statistiques');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);
        const filteredData = data.filter((person) =>
            `${person.nom} ${person.prenom}`.toLowerCase().includes(searchTerm)
        );
        setFilteredData(filteredData);
    };

    const showNotification = (type, title, message) => {
        setNotification({ show: true, type, title, message });
        setTimeout(() => setNotification({ show: false, type: '', title: '', message: '' }), 3000);
    };

    return (
        <>
            <div className="min-h-full">
                <Header currentPage="Dashboard" />
                <main className="-mt-32">
                    <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                            {statsError ? (
                                <ErrorMessage title="Erreur des Statistiques" messages={[statsError]} />
                            ) : (
                                <StatsCards club={'ES Morannes'} statsData={statsDataESM} />
                            )}
                            <div className="mt-6" />
                            {statsError ? (
                                <ErrorMessage title="Erreur des Statistiques" messages={[statsError]} />
                            ) : (
                                <StatsCards club={'GJ'} statsData={statsDataGJ} />
                            )}
                        </div>
                    </div>
                    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                            {personError ? (
                                <ErrorMessage title="Erreur des Données Personnelles" messages={[personError]} />
                            ) : (
                                <PersonTable
                                    filteredData={filteredData}
                                    fetchData={fetchData}
                                    handleSearch={handleSearch}
                                    searchTerm={searchTerm}
                                    showNotification={showNotification} // Passer la fonction de notification
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Notification
                show={notification.show}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification({ show: false, type: '', title: '', message: '' })}
            />
        </>
    );
};

export default HomePage;