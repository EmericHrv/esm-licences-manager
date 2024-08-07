import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const ManageStockModal = ({ club, tailles, closeModal, refreshData, setNotification }) => {
    const [selectedTaille, setSelectedTaille] = useState(tailles[0].taille);
    const [totalQuantite, setTotalQuantite] = useState(0);
    const [restantQuantite, setRestantQuantite] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stockTotal, setStockTotal] = useState(tailles[0].stockTotal);
    const [stockRestant, setStockRestant] = useState(tailles[0].stockRestant);

    useEffect(() => {
        const taille = tailles.find(t => t.taille === selectedTaille);
        if (taille) {
            setStockTotal(taille.stockTotal);
            setStockRestant(taille.stockRestant);
        }
    }, [selectedTaille, tailles]);

    const handleSave = async () => {
        const updates = [
            {
                endpoint: totalQuantite < 0 ? `${API_BASE_URL}/stocks/total/remove` : `${API_BASE_URL}/stocks/total/add`,
                method: totalQuantite < 0 ? 'PUT' : 'POST',
                body: {
                    club: club,
                    taille: selectedTaille,
                    quantite: Math.abs(parseInt(totalQuantite, 10))
                }
            },
            {
                endpoint: restantQuantite < 0 ? `${API_BASE_URL}/stocks/restant/remove` : `${API_BASE_URL}/stocks/restant/add`,
                method: restantQuantite < 0 ? 'PUT' : 'POST',
                body: {
                    club: club,
                    taille: selectedTaille,
                    quantite: Math.abs(parseInt(restantQuantite, 10))
                }
            }
        ];

        try {
            setLoading(true);

            await Promise.all(updates.map(async (update) => {
                const response = await fetch(update.endpoint, {
                    method: update.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(update.body),
                });
                if (!response.ok) {
                    throw new Error(`Échec de la mise à jour à ${update.endpoint}`);
                }
                return response;
            }));

            setNotification({
                type: 'success',
                title: 'Succès',
                message: 'Stock mis à jour avec succès!'
            });
            refreshData();
        } catch (error) {
            setNotification({
                type: 'error',
                title: 'Erreur',
                message: error.message
            });
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    return (
        <Dialog open={true} onClose={closeModal} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                <PencilIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-black">
                                    Gérer le stock
                                </DialogTitle>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700">Taille</label>
                                    <select
                                        value={selectedTaille}
                                        onChange={e => setSelectedTaille(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                    >
                                        {tailles.map((taille) => (
                                            <option key={taille.taille} value={taille.taille}>{taille.taille}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:grid sm:grid-cols-2 sm:gap-4">
                            <div>
                                <h4 className="text-base font-semibold leading-6 text-gray-900">Stock Restant ({stockRestant})</h4>
                                <label className="block text-sm font-medium text-gray-700 mt-2">Quantité</label>
                                <input
                                    type="number"
                                    value={restantQuantite}
                                    onChange={e => setRestantQuantite(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                />
                                <p className="mt-1 text-sm text-gray-500">La quantité sera ajoutée ou soustraite du stock restant actuel.</p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <h4 className="text-base font-semibold leading-6 text-gray-900">Stock Total ({stockTotal})</h4>
                                <label className="block text-sm font-medium text-gray-700 mt-2">Quantité</label>
                                <input
                                    type="number"
                                    value={totalQuantite}
                                    onChange={e => setTotalQuantite(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                />
                                <p className="mt-1 text-sm text-gray-500">La quantité sera ajoutée ou soustraite du stock total actuel.</p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                                className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light sm:ml-3 sm:w-auto"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Annuler
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ManageStockModal;
