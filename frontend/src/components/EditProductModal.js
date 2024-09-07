'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const EditProductModal = ({ person, closeModal, showNotification }) => {
    // Valeurs initiales pour les produits, en tenant compte des produits déjà remis
    const initialProductLicenceValue = person.produit_licence_taille ? person.produit_licence_taille : 'Non-Remis';
    const initialProductLicenceMaillotValue = person.produit_licence_taille_maillot ? person.produit_licence_taille_maillot : 'Non-Remis';
    const initialProductLicenceShortValue = person.produit_licence_taille_short ? person.produit_licence_taille_short : 'Non-Remis';
    const initialProductLicenceChaussettesValue = person.produit_licence_taille_chaussettes ? person.produit_licence_taille_chaussettes : 'Non-Remis';

    // États séparés pour chaque produit
    const [productLicenceTaille, setProductLicenceTaille] = useState(initialProductLicenceValue);
    const [maillotTaille, setMaillotTaille] = useState(initialProductLicenceMaillotValue);
    const [shortTaille, setShortTaille] = useState(initialProductLicenceShortValue);
    const [chaussettesTaille, setChaussettesTaille] = useState(initialProductLicenceChaussettesValue);
    const [loading, setLoading] = useState(false);

    // Tailles disponibles par produit pour GJ
    const [taillesDisponibles, setTaillesDisponibles] = useState({
        maillot: [],
        short: [],
        chaussettes: [],
    });

    const [esmTailles, setEsmTailles] = useState([]); // Ajout pour stocker les tailles ESM

    useEffect(() => {
        if (person.club === 'GJ') {
            // On récupère les tailles pour GJ
            fetchStockData(person.club, 'maillot');
            fetchStockData(person.club, 'short');
            fetchStockData(person.club, 'chaussettes');
        } else if (person.club === 'ESM') {
            // On récupère les tailles pour ESM
            fetchEsmStockData(person.club);
        }

        // Mise à jour des valeurs des tailles à l'ouverture du modal si déjà remis
        setProductLicenceTaille(initialProductLicenceValue);
        setMaillotTaille(initialProductLicenceMaillotValue);
        setShortTaille(initialProductLicenceShortValue);
        setChaussettesTaille(initialProductLicenceChaussettesValue);
    }, [person.club, initialProductLicenceValue, initialProductLicenceMaillotValue, initialProductLicenceShortValue, initialProductLicenceChaussettesValue]);

    const fetchStockData = async (club, produit) => {
        try {
            const response = await fetch(`${API_BASE_URL}/stocks`);
            const data = await response.json();

            const clubStock = data.find((stock) => stock.club === club);
            if (clubStock && produit) {
                // On ne récupère les tailles que si le club est GJ et un produit est précisé
                const productStock = clubStock.produits.find((p) => p.product === produit);
                if (productStock) {
                    const orderedTailles = productStock.tailles.sort((a, b) => {
                        const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '164', '152', '140', '128', '116'];
                        return order.indexOf(a.taille) - order.indexOf(b.taille);
                    });
                    setTaillesDisponibles((prev) => ({
                        ...prev,
                        [produit]: orderedTailles,
                    }));
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stocks:', error);
        }
    };

    const fetchEsmStockData = async (club) => {
        try {
            const response = await fetch(`${API_BASE_URL}/stocks`);
            const data = await response.json();

            const clubStock = data.find((stock) => stock.club === club);
            if (clubStock && clubStock.produits.length > 0) {
                const esmStock = clubStock.produits[0].tailles.sort((a, b) => {
                    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
                    return order.indexOf(a.taille) - order.indexOf(b.taille);
                });
                setEsmTailles(esmStock);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des stocks pour ESM:', error);
        }
    };

    const handleSave = async () => {
        const isNonRemis = productLicenceTaille === 'Non-Remis';
        const isMaillotNonRemis = maillotTaille === 'Non-Remis';
        const isShortNonRemis = shortTaille === 'Non-Remis';
        const isChaussettesNonRemis = chaussettesTaille === 'Non-Remis';
        const club = person.club;

        try {
            setLoading(true);

            // Gestion pour le club GJ (maillot, short, chaussettes)
            if (club === 'GJ') {
                // Gestion du maillot
                if (person.produit_licence_taille_maillot !== maillotTaille) {
                    if (person.produit_licence_taille_maillot && person.produit_licence_taille_maillot !== 'Non-Remis') {
                        // Ajouter au stock l'ancienne taille de maillot
                        await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: person.produit_licence_taille_maillot, quantite: 1, product: 'maillot' }),
                        });
                    }
                    if (!isMaillotNonRemis) {
                        // Retirer du stock la nouvelle taille de maillot
                        await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: maillotTaille, quantite: 1, product: 'maillot' }),
                        });
                    }
                }

                // Gestion du short
                if (person.produit_licence_taille_short !== shortTaille) {
                    if (person.produit_licence_taille_short && person.produit_licence_taille_short !== 'Non-Remis') {
                        // Ajouter au stock l'ancienne taille de short
                        await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: person.produit_licence_taille_short, quantite: 1, product: 'short' }),
                        });
                    }
                    if (!isShortNonRemis) {
                        // Retirer du stock la nouvelle taille de short
                        await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: shortTaille, quantite: 1, product: 'short' }),
                        });
                    }
                }

                // Gestion des chaussettes
                if (person.produit_licence_taille_chaussettes !== chaussettesTaille) {
                    if (person.produit_licence_taille_chaussettes && person.produit_licence_taille_chaussettes !== 'Non-Remis') {
                        // Ajouter au stock l'ancienne taille de chaussettes
                        await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: person.produit_licence_taille_chaussettes, quantite: 1, product: 'chaussettes' }),
                        });
                    }
                    if (!isChaussettesNonRemis) {
                        // Retirer du stock la nouvelle taille de chaussettes
                        await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: chaussettesTaille, quantite: 1, product: 'chaussettes' }),
                        });
                    }
                }
            }

            // Gestion pour le club ESM (un seul produit avec une taille)
            if (club === 'ESM') {
                if (person.produit_licence_taille !== productLicenceTaille) {
                    if (person.produit_licence_taille && person.produit_licence_taille !== 'Non-Remis') {
                        // Ajouter au stock l'ancienne taille pour ESM
                        await fetch(`${API_BASE_URL}/stocks/restant/add`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: person.produit_licence_taille, quantite: 1 }),
                        });
                    }
                    if (!isNonRemis) {
                        // Retirer du stock la nouvelle taille pour ESM
                        await fetch(`${API_BASE_URL}/stocks/restant/remove`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ club, taille: productLicenceTaille, quantite: 1 }),
                        });
                    }
                }
            }

            // Détermine si le produit licence doit être marqué comme remis ou non
            const produitLicenceRemis = !isNonRemis || !isMaillotNonRemis || !isShortNonRemis || !isChaussettesNonRemis;

            // Mise à jour des informations de la personne
            const body = {
                produit_licence: produitLicenceRemis, // Si au moins un produit est remis
                produit_licence_taille_maillot: club === 'GJ' ? (isMaillotNonRemis ? '' : maillotTaille) : undefined,
                produit_licence_taille_short: club === 'GJ' ? (isShortNonRemis ? '' : shortTaille) : undefined,
                produit_licence_taille_chaussettes: club === 'GJ' ? (isChaussettesNonRemis ? '' : chaussettesTaille) : undefined,
                produit_licence_taille: club === 'ESM' ? (isNonRemis ? '' : productLicenceTaille) : undefined,
            };

            const response = await fetch(`${API_BASE_URL}/persons/${person.numero_personne}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

                                {/* Gestion spécifique pour ESM */}
                                {person.club === 'ESM' && (
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-700">Taille Produit Licence</label>
                                        <select
                                            value={productLicenceTaille}
                                            onChange={(e) => setProductLicenceTaille(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                        >
                                            <option value="Non-Remis">Non-Remis</option>
                                            {esmTailles.map((taille) => (
                                                <option key={taille.taille} value={taille.taille} disabled={taille.stockRestant === 0}>
                                                    {taille.taille} {taille.stockRestant === 0 && '(indisponible)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Gestion spécifique pour GJ */}
                                {person.club === 'GJ' && (
                                    <>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">Taille Maillot</label>
                                            <select
                                                value={maillotTaille}
                                                onChange={(e) => setMaillotTaille(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                            >
                                                <option value="Non-Remis">Non-Remis</option>
                                                {taillesDisponibles.maillot.map((taille) => {
                                                    const correspondanceAge = {
                                                        '164': ' (13-14 ans)',
                                                        '152': ' (11-12 ans)',
                                                        '140': ' (9-10 ans)',
                                                        '128': ' (7-8 ans)',
                                                        '116': ' (5-6 ans)',
                                                    };
                                                    return (
                                                        <option key={taille.taille} value={taille.taille} disabled={taille.stockRestant === 0}>
                                                            {taille.taille}
                                                            {correspondanceAge[taille.taille] || ''} {/* Affiche la correspondance d'âge si elle existe */}
                                                            {taille.stockRestant === 0 && ' (indisponible)'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">Taille Short</label>
                                            <select
                                                value={shortTaille}
                                                onChange={(e) => setShortTaille(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                            >
                                                <option value="Non-Remis">Non-Remis</option>
                                                {taillesDisponibles.short.map((taille) => {
                                                    const correspondanceAge = {
                                                        '164': ' (13-14 ans)',
                                                        '152': ' (11-12 ans)',
                                                        '140': ' (9-10 ans)',
                                                        '128': ' (7-8 ans)',
                                                        '116': ' (5-6 ans)',
                                                    };
                                                    return (
                                                        <option key={taille.taille} value={taille.taille} disabled={taille.stockRestant === 0}>
                                                            {taille.taille}
                                                            {correspondanceAge[taille.taille] || ''} {/* Affiche la correspondance d'âge si elle existe */}
                                                            {taille.stockRestant === 0 && ' (indisponible)'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">Taille Chaussettes</label>
                                            <select
                                                value={chaussettesTaille}
                                                onChange={(e) => setChaussettesTaille(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                                            >
                                                <option value="Non-Remis">Non-Remis</option>
                                                {taillesDisponibles.chaussettes.map((taille) => (
                                                    <option key={taille.taille} value={taille.taille} disabled={taille.stockRestant === 0}>
                                                        {taille.taille} {taille.stockRestant === 0 && '(indisponible)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
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

