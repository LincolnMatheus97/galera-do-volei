'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, LogIn, LogOut, MessageCircle, Ticket, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Define os links com base no estado de login, mantendo as rotas originais do seu projeto
  const navLinks = isAuthenticated ? [
    { href: '/dashboard', label: 'Eventos', icon: Home },
    { href: '/meus-eventos', label: 'Minhas Inscrições', icon: Ticket },
    { href: '/mensagens', label: 'Social', icon: MessageCircle },
    { href: '/convites', label: 'Convites', icon: Mail },
  ] : [
    { href: '/', label: 'Início', icon: Home },
  ];

  const isActive = (path: string) => pathname === path;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LOGO --- */}
          <Link 
            href={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300">
              <span className="text-white font-bold text-lg">GV</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">
              Galera do <span className="text-blue-600">Vôlei</span>
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(link.href) 
                    ? 'text-blue-600 font-bold' 
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* --- USER AREA (Desktop) --- */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <Link 
                  href="/perfil"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                    {getInitial(user.nome)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-none">{user.nome.split(' ')[0]}</span>
                    <span className="text-[10px] text-gray-500 font-medium">Ver Perfil</span>
                  </div>
                </Link>
                
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                 <Link href="/login" className="text-gray-600 hover:text-blue-700 font-medium text-sm px-3 py-2">
                    Entrar
                 </Link>
                 <Link
                  href="/cadastro"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4" />
                  <span>Criar Conta</span>
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              <div className="my-2 border-t border-gray-100 mx-4" />

              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitial(user.nome)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.nome}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair da Conta</span>
                  </button>
                </>
              ) : (
                <div className="px-4 flex flex-col gap-3 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md"
                  >
                    <User className="w-4 h-4" />
                    Criar Conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;