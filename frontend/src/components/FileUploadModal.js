'use client';

import React, { useRef } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { FolderPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUploadModal = ({ isModalOpen, closeModal, handleFileChange, handleFileUpload, showNotification }) => {
    const fileInputRef = useRef(null);

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            await handleFileUpload(event);
            showNotification('success', 'Succès', 'Fichier importé avec succès');
        } catch (error) {
            showNotification('error', 'Erreur', 'Échec de l\'importation du fichier');
        } finally {
            closeModal();
        }
    };

    return (
        <Dialog open={isModalOpen} onClose={closeModal} className="relative z-10">
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
                                <FolderPlusIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-black">
                                    Importer un fichier
                                </DialogTitle>
                                <div className="mt-2 cursor-pointer">
                                    <form onSubmit={onSubmit} className="space-y-4 cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".xlsx"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                                       file:mr-4 file:py-2 file:px-4
                                                       file:rounded-full file:border-0
                                                       file:text-sm file:font-semibold
                                                       file:bg-yellow-50 file:text-primary
                                                       hover:file:bg-yellow-100 cursor-pointer"
                                            ref={fileInputRef}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={onSubmit}
                                className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-light sm:ml-3 sm:w-auto"
                            >
                                Importer
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

export default FileUploadModal;
