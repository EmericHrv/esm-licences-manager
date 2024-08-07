import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ searchTerm, handleSearch }) => {
    return (
        <div className="mt-4 w-full">
            <div className="relative text-gray-400 focus-within:text-gray-600 w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5" />
                </div>
                <input
                    id="search"
                    name="search"
                    type="search"
                    placeholder="Rechercher"
                    className="block w-full rounded-md border-0 bg-gray-50 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg py-1.5 pl-10 pr-3 text-black focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary sm:text-sm sm:leading-6"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
        </div>
    );
};

export default SearchBar;
