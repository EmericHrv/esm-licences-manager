'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const EditProductModal = ({ person, closeModal, showNotification }) => {
    const initialProductLicenceValue = person.produit_licence ? person.produit_licence_taille : 'Non-Remis';
    const [produitLicenceTaille, setProduitLicenceTaille] = useState(initialProductLicenceValue);
    const [loading, setLoading] = useState(false);
    const [taillesDisponibles, setTaillesDisponibles] = useState([]);

    useEffect(() => {
        fetchStockData(person.club);
    }, [person.club]);

    const fetchStockData = async (club) => {
        try {
            const response = await fetch(`${API_BASE_URL}/stocks`);
            const data = await response.json();

            const clubStock = data.find((stock) => stock.club === club);
            if (clubStock) {
                const orderedTailles = clubStock.tailles.sort((a, b) => {
                    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
                    return order.indexOf(a.taille) - order.indexOf(b.taille);
                });
                setTaillesDisponibles(orderedTailles);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stocks:', error);
        }
    };

    const handleSave = async () => {
        const isNonRemis = produitLicenceTaille === 'Non-Remis';
        const previousProductLicence = person.produit_licence;
        const previousTaille = person.produit_licence_taille;
        const club = person.club;

        try {
            setLoading(true);

            // Adjust stock if necessary
            if (!previousProductLicence && !isNonRemis) {
                // No previous licence, adding new licence
                await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        club: club,
                        taille: produitLicenceTaille,
                        quantite: 1
                    }),
                });
            } else if (previousProductLicence && previousTaille !== produitLicenceTaille) {
                // Previous licence exists, updating taille
                if (previousTaille !== 'Non-Remis') {
                    await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            club: club,
                            taille: previousTaille,
                            quantite: 1
                        }),
                    });
                }
                if (!isNonRemis) {
                    await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            club: club,
                            taille: produitLicenceTaille,
                            quantite: 1
                        }),
                    });
                }
            } else if (previousProductLicence && isNonRemis && previousTaille !== 'Non-Remis') {
                // If the new state is Non-Remis, adjust only the old taille
                await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        club: club,
                        taille: previousTaille,
                        quantite: 1
                    }),
                });
            }

            // Update person's licence information
            const body = {
                produit_licence: !isNonRemis,
                produit_licence_taille: isNonRemis ? '' : produitLicenceTaille
            };

            const response = await fetch(`${API_BASE_URL}/persons/${person.numero_personne}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                showNotification('success', 'Succès', 'Produit licence mis à jour avec succès');
                closeModal();
            } else {
                showNotification('error', 'Erreur', 'Échec de la mise à jour du produit licence');
            }
        } catch (error) {
            showNotification('error', 'Erreur', 'Erreur lors de la mise à jour du produit licence');
        } finally {
            setLoading(false);
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
                        className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
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
                                    Éditer le produit licence
                                </DialogTitle>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700">Taille Produit Licence</label>
                                    <select
                                        value={produitLicenceTaille}
                                        onChange={e => setProduitLicenceTaille(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                    >
                                        <option value="Non-Remis">Non-Remis</option>
                                        {taillesDisponibles.map((taille) => (
                                            <option key={taille.taille} value={taille.taille} disabled={taille.stockRestant === 0}>
                                                {taille.taille} {taille.stockRestant === 0 && '(indisponible)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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

export default EditProductModal;
