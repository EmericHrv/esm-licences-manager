import React from 'react';

const stats = [
    { name: 'Nombre de licenciés', statKey: 'personsCount' },
    { name: 'Nombre de licences', statKey: 'licencesCount' },
    { name: 'Licences non payées', statKey: 'licencesNonPayeesCount' },
    { name: 'Produits remis', statKey: 'produitsRemisCount' },
];

const StatsCards = ({ statsData }) => {
    return (
        <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Bilan des licences</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{statsData[item.statKey]}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

export default StatsCards;
