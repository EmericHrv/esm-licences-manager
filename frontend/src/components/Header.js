import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Stock', href: '/stock' },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Header = ({ currentPage }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="bg-primary pb-32">
            <Disclosure as="nav" className="bg-primary">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="border-b border-yellow-200">
                                <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <img
                                                alt="ES Morannes"
                                                src={logo}
                                                className="h-8 w-8"
                                            />
                                        </div>
                                        <h1 className="ml-5 text-2xl font-semibold leading-6 text-black">Licences Manager</h1>
                                        <div className="hidden md:block">
                                            <div className="ml-10 flex items-baseline space-x-4">
                                                {navigation.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        to={item.href}
                                                        className={classNames(
                                                            location.pathname === item.href
                                                                ? 'bg-black text-white'
                                                                : 'text-black hover:bg-gray-700 hover:text-white',
                                                            'rounded-md px-3 py-2 text-sm font-medium'
                                                        )}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <button
                                            onClick={handleLogout}
                                            className="ml-4 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                        >
                                            <ArrowLeftOnRectangleIcon className="h-5 w-5 inline-block -mt-1 mr-2" aria-hidden="true" />
                                            Déconnexion
                                        </button>
                                    </div>
                                    <div className="-mr-2 flex md:hidden">
                                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-black p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                                            <span className="absolute -inset-0.5" />
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon aria-hidden="true" className="block h-6 w-6" />
                                            ) : (
                                                <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
                                            )}
                                        </DisclosureButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DisclosurePanel className="border-b border-gray-700 md:hidden">
                            <div className="space-y-1 px-2 py-3 sm:px-3">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={classNames(
                                            location.pathname === item.href ? 'bg-black text-white' : 'text-black hover:bg-gray-700 hover:text-white',
                                            'block rounded-md px-3 py-2 text-base font-medium'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="mt-1 block w-full rounded-md bg-black px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 inline-block -mt-1 mr-2" aria-hidden="true" />
                                    Déconnexion
                                </button>
                            </div>
                        </DisclosurePanel>
                    </>
                )}
            </Disclosure>
            <header className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{currentPage}</h1>
                </div>
            </header>
        </div>
    );
};

export default Header;
