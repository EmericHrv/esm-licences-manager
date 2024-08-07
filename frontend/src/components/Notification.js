// components/Notification.js
import React from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon as XMarkIconSolid } from '@heroicons/react/20/solid';

const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
};

const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-primary',
};

const Notification = ({ show, type, title, message, onClose }) => {
    const Icon = icons[type] || InformationCircleIcon;
    const colorClass = colors[type] || 'text-primary';

    return (
        <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <Transition show={show}>
                    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Icon aria-hidden="true" className={`h-6 w-6 ${colorClass}`} />
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">{title}</p>
                                    <p className="mt-1 text-sm text-gray-500">{message}</p>
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIconSolid aria-hidden="true" className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    );
};

export default Notification;
