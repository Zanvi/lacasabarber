import React, { useState } from 'react';
import { User } from '../types';
import { BARBERSHOP_INFO } from '../constants';
import { db } from '../services/dataService';
import { Lock, Smartphone } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    if (numbers.length > 2) formatted = `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    if (numbers.length > 7) formatted = `${formatted.substring(0, 10)}-${formatted.substring(10, 14)}`;
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (adminPass === 'admin123') { // Simple mock password
        const user = db.login('Danilo (Admin)', '00000000000', true);
        onLogin(user);
      } else {
        setError('Senha incorreta.');
      }
      return;
    }

    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Por favor, preencha seu nome e um telefone válido.');
      return;
    }
    const user = db.login(name, phone, false);
    onLogin(user);
  };

  const handleGoogleLogin = () => {
    // Simulating Google Auth
    const user = db.login('Via Google User', '11999998888', false);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-barber-black px-4 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative max-w-md w-full bg-zinc-900/90 p-8 rounded-xl shadow-2xl border border-zinc-800 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-barber-red rounded-full mx-auto flex items-center justify-center mb-4 text-3xl shadow-[0_0_20px_rgba(211,47,47,0.4)] animate-pulse">
            💈
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider font-sans">{BARBERSHOP_INFO.name}</h1>
          <p className="text-barber-muted mt-2">
            {isAdminMode ? 'Acesso Administrativo' : 'Agende seu horário online'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAdminMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-barber-muted mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-barber-red focus:ring-1 focus:ring-barber-red transition-all"
                  placeholder="Ex: Victor Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-barber-muted mb-2">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-barber-red focus:ring-1 focus:ring-barber-red transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}

          {isAdminMode && (
            <div>
              <label className="block text-sm font-medium text-barber-muted mb-2">Senha do Admin</label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-barber-red focus:ring-1 focus:ring-barber-red transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-900/20 py-2 rounded">{error}</p>}

          <button
            type="submit"
            className="w-full bg-barber-red hover:bg-barber-redHover text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {isAdminMode ? <Lock size={18} /> : <Smartphone size={18} />}
            {isAdminMode ? 'ACESSAR PAINEL' : 'ENTRAR COM CELULAR'}
          </button>

          {!isAdminMode && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              ENTRAR COM GOOGLE
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsAdminMode(!isAdminMode); setError(''); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            {isAdminMode ? 'Voltar para login de cliente' : 'Sou administrador'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;