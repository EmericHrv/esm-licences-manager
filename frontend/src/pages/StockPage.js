'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import StockCards from '../components/StockCards';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const StockPage = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/stocks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setData(data);
                setError('');
            } else {
                setError('Échec de la récupération des données');
            }
        } catch (error) {
            setError('Une erreur est survenue');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    return (
        <>
            <div className="min-h-full">
                <Header currentPage="Stock" />
                <main className="-mt-32">
                    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                        {error ? (

                            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                                <ErrorMessage title="Erreur de Stock" messages={[error]} />
                            </div>
                        ) : (
                            data.map((clubData) => (
                                <StockCards key={clubData.club} club={clubData.club} tailles={clubData.tailles} refreshData={refreshData} />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default StockPage;
