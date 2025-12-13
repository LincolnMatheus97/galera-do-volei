'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Menu, X, MessageCircle } from 'lucide-react'; // Adicionei MessageCircle
import { useState } from 'react';

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo e Links Principais */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold text-blue-600">
                                Galera do Vôlei
                            </Link>
                        </div>
                        {isAuthenticated && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link 
                                    href="/dashboard" 
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    Eventos
                                </Link>
                                <Link 
                                    href="/meus-eventos" 
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    Minhas Inscrições
                                </Link>
                                <Link 
                                    href="/mensagens" 
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    <MessageCircle size={18} className="mr-1" />
                                    Social
                                </Link>
                                <Link 
                                    href="/convites" 
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    Convites
                                </Link>
                                <Link 
                                    href="/perfil" 
                                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                                >
                                    Perfil
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Área do Usuário (Desktop) */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-full">
                                    <User className="mr-2 h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Olá, {user?.nome}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center transition-colors"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </button>
                            </>
                        ) : (
                            <div className="space-x-3">
                                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
                                    Entrar
                                </Link>
                                <Link href="/cadastro" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-md transition-all hover:-translate-y-0.5">
                                    Criar Conta
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Botão Mobile */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Mobile */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-200">
                    <div className="pt-2 pb-3 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                    Eventos
                                </Link>
                                <Link href="/meus-eventos" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                    Minhas Inscrições
                                </Link>
                                <Link href="/mensagens" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                    Social
                                </Link>
                                <Link href="/convites" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                    Convites
                                </Link>
                                <Link href="/perfil" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                    Perfil
                                </Link>
                                <div className="border-t border-gray-200 pt-4 pb-1">
                                    <div className="px-4 flex items-center">
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-gray-800">{user?.nome}</div>
                                            <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 px-2">
                                        <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                                    Entrar
                                </Link>
                                <Link href="/cadastro" className="block px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                    Criar Conta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}