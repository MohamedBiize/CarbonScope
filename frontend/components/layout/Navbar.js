import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { MenuIcon, XIcon, UserCircleIcon, LogoutIcon, LoginIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="flex-shrink-0 flex items-center cursor-pointer">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="CarbonScope AI"
                />
                <span className="ml-2 text-xl font-bold">CarbonScope AI</span>
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/dashboard">
                <span className="text-white hover:text-green-200 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Dashboard
                </span>
              </Link>
              <Link href="/visualisations">
                <span className="text-white hover:text-green-200 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Visualisations
                </span>
              </Link>
              <Link href="/simulateur">
                <span className="text-white hover:text-green-200 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Simulateur
                </span>
              </Link>
              <Link href="/scores">
                <span className="text-white hover:text-green-200 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Scores Carbone
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/profil">
                  <span className="flex items-center text-sm cursor-pointer">
                    <UserCircleIcon className="h-6 w-6 mr-1" />
                    {session.user.name || session.user.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-sm bg-green-700 hover:bg-green-600 px-3 py-2 rounded-md"
                >
                  <LogoutIcon className="h-5 w-5 mr-1" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center text-sm bg-green-700 hover:bg-green-600 px-3 py-2 rounded-md"
              >
                <LoginIcon className="h-5 w-5 mr-1" />
                Connexion
              </button>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-200 hover:bg-green-700 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard">
              <span className="text-white hover:text-green-200 block px-3 py-2 rounded-md text-base font-medium cursor-pointer">
                Dashboard
              </span>
            </Link>
            <Link href="/visualisations">
              <span className="text-white hover:text-green-200 block px-3 py-2 rounded-md text-base font-medium cursor-pointer">
                Visualisations
              </span>
            </Link>
            <Link href="/simulateur">
              <span className="text-white hover:text-green-200 block px-3 py-2 rounded-md text-base font-medium cursor-pointer">
                Simulateur
              </span>
            </Link>
            <Link href="/scores">
              <span className="text-white hover:text-green-200 block px-3 py-2 rounded-md text-base font-medium cursor-pointer">
                Scores Carbone
              </span>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-green-700">
            {session ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{session.user.name || session.user.email}</div>
                  <div className="text-sm font-medium text-green-200">{session.user.email}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="ml-auto flex-shrink-0 bg-green-700 p-1 rounded-full text-white hover:text-green-200 focus:outline-none"
                >
                  <LogoutIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="px-5">
                <button
                  onClick={() => signIn()}
                  className="flex items-center text-sm bg-green-700 hover:bg-green-600 px-3 py-2 rounded-md w-full"
                >
                  <LoginIcon className="h-5 w-5 mr-1" />
                  Connexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
