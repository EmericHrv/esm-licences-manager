import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit'; // Assurez-vous d'avoir installé @mui/icons-material
import EditProductModal from './EditProductModal';
import FileUploadModal from './FileUploadModal';
import { FolderPlusIcon } from '@heroicons/react/24/outline';
import SearchBar from './SearchBar';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.licences-manager.esmorannes.com/api';

const PersonTable = ({ filteredData, fetchData, handleSearch, searchTerm, showNotification }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [file, setFile] = useState(null);

    const openEditModal = (person) => {
        setSelectedPerson(person);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedPerson(null);
        setIsEditModalOpen(false);
        fetchData(); // Recharger les données après la fermeture du modal
    };

    const openFileModal = () => {
        setIsFileModalOpen(true);
    };

    const closeFileModal = () => {
        setIsFileModalOpen(false);
        setFile(null); // Réinitialiser le fichier sélectionné
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        if (!file) {
            alert('Veuillez sélectionner un fichier à importer');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/persons/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                showNotification('success', 'Succès', 'Fichier importé avec succès');
                setFile(null);
                setIsFileModalOpen(false);
                fetchData();
            } else {
                showNotification('error', 'Erreur', 'Échec de l\'importation du fichier');
            }
        } catch (error) {
            showNotification('error', 'Erreur', 'Une erreur s\'est produite lors de l\'importation du fichier');
        }
    };

    const getBadgeClass = (category) => {
        switch (category) {
            case 'En Totalité':
                return 'inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700';
            case 'Non-Réglé':
                return 'inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700';
            case 'Remis':
                return 'inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700';
            case 'Non Remis':
                return 'inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700';
            default:
                return 'inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600';
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-black">Gestionnaire des licences</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={openFileModal}
                        className="block rounded-md bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        <FolderPlusIcon className="h-6 w-6 inline-block -mt-1 mr-2" aria-hidden="true" />
                        Importer un fichier
                    </button>
                </div>
            </div>
            <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black sm:pl-6">
                                            Licencié
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            Licences
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            Prix
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            État de règlement
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            Mode de règlement
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black whitespace-normal break-words">
                                            Libellé de règlement
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            Produit Licence
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-black">
                                            Éditer
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredData.map(person => {
                                        const hasMultipleLicences = person.licences.length > 1;
                                        const relevantLicences = hasMultipleLicences
                                            ? person.licences.filter(
                                                licence => licence.categorie !== 'Dirigeant' && licence.categorie !== 'Educateur Fédéral'
                                            )
                                            : person.licences;

                                        const primaryLicence = relevantLicences.length > 0 ? relevantLicences[0] : null;

                                        return (
                                            <tr key={person._id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                                    {`${person.nom} ${person.prenom}`}
                                                    <br />
                                                    <span className="text-xs text-gray-500">{person.nom_club}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {person.licences.length > 0 ? (
                                                        person.licences.map(licence => (
                                                            <span key={licence._id} className="inline-flex items-center rounded-full bg-primary-light px-1.5 py-0.5 text-xs font-medium text-yellow-700 mr-2">
                                                                {licence.categorie}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">Aucune licence</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{primaryLicence ? `${primaryLicence.prix} €` : ''}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {primaryLicence ? (
                                                        <span className={getBadgeClass(primaryLicence.etat_reglement && primaryLicence.etat_reglement.toLowerCase() === 'en totalité' ? 'En Totalité' : 'Non-Réglé')}>
                                                            {primaryLicence.etat_reglement && primaryLicence.etat_reglement.toLowerCase() === 'en totalité' ? 'En Totalité' : 'Non-Réglé'}
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{primaryLicence ? primaryLicence.mode_reglement : ''}</td>
                                                <td className="whitespace-normal break-words px-3 py-4 text-sm text-gray-500">{primaryLicence ? primaryLicence.libelle_reglement : ''}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    {person.produit_licence ? (
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 mr-2">{person.produit_licence_taille ? `Remis (${person.produit_licence_taille})` : 'Remis'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 mr-2">Non Remis</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(person)}
                                                        className="text-gray-500 hover:text-primary"
                                                    >
                                                        <EditIcon className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <EditProductModal
                    person={selectedPerson}
                    closeModal={closeEditModal}
                    showNotification={showNotification} // Passer la fonction de notification
                />
            )}
            {isFileModalOpen && (
                <FileUploadModal
                    isModalOpen={isFileModalOpen}
                    closeModal={closeFileModal}
                    handleFileChange={handleFileChange}
                    handleFileUpload={handleFileUpload}
                    showNotification={showNotification} // Passer la fonction de notification
                />
            )}
        </div>
    );
};

export default PersonTable;
