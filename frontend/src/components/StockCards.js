// components/StockCards.js
import React, { useState } from 'react';
import { CubeIcon } from '@heroicons/react/20/solid';
import ManageStockModal from './ManageStockModal';
import Notification from './Notification';

const order = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

const StockCards = ({ club, tailles, refreshData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ type: 'info', title: '', message: '' });

    const handleManageStock = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const sortedTailles = tailles.sort((a, b) => {
        return order.indexOf(a.taille) - order.indexOf(b.taille);
    });

    return (
        <div className="mb-8 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold leading-6 text-gray-900">{club}</h2>
                <button
                    type="button"
                    onClick={handleManageStock}
                    className="block rounded-md bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <CubeIcon className="h-6 w-6 inline-block -mt-1 mr-2" aria-hidden="true" />
                    Gérer le stock
                </button>
            </div>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {sortedTailles.map((taille) => {
                    const percentage = (taille.stockRestant / taille.stockTotal) * 100;
                    const progressBarColor = taille.stockRestant === 0 ? 'bg-red-100' : 'bg-primary';
                    return (
                        <div key={taille.taille} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                            <dt className="truncate text-sm font-medium text-gray-500">Taille: {taille.taille}</dt>
                            <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{taille.stockRestant}/{taille.stockTotal}</dd>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="flex justify-between text-sm mt-1 text-gray-500">
                                <span>Restant</span>
                                <span>Total</span>
                            </div>
                        </div>
                    );
                })}
            </dl>
            {isModalOpen && (
                <ManageStockModal
                    club={club}
                    tailles={tailles}
                    closeModal={closeModal}
                    refreshData={refreshData}
                    setNotification={(notif) => {
                        setNotification(notif);
                        setShowNotification(true);
                        setTimeout(() => setShowNotification(false), 3000); // Hide after 3 seconds
                    }}
                />
            )}
            <Notification
                show={showNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setShowNotification(false)}
            />
        </div>
    );
};

export default StockCards;
