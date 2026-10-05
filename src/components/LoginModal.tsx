import React, { useState } from 'react';
import { MSBDatabase } from '../utils/storage';
import { SesionUsuario } from '../types';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { PrivacidadISOModal } from './PrivacidadISOModal';
import { SelloInstitucional } from './SelloInstitucional';

interface LoginModalProps {
  onLoginExitoso: (user: SesionUsuario) => void;
  onIrARegistro: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginExitoso, onIrARegistro }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarISOModal, setMostrarISOModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Por favor introduce tu nombre de usuario institucional.');
      return;
    }

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('El PIN debe contener exactamente 6 dígitos numéricos.');
      return;
    }

    setCargando(true);
    try {
      const res = await MSBDatabase.login(username, pin);
      if (res.ok && res.user) {
        MSBDatabase.setSession(res.user);
        onLoginExitoso(res.user);
      } else {
        setError(res.mensaje || 'Usuario o PIN incorrectos.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al validar el acceso institucional.');
    } finally {
      setCargando(false);
    }
  };

  // Quick login helper for testing
  const loginRapido = async (demoUser: string, demoPin: string) => {
    setUsername(demoUser);
    setPin(demoPin);
    setCargando(true);
    setError(null);
    try {
      const res = await MSBDatabase.login(demoUser, demoPin);
      if (res.ok && res.user) {
        MSBDatabase.setSession(res.user);
        onLoginExitoso(res.user);
      } else {
        setError(res.mensaje || 'Error en acceso rápido.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[#0a192f] rounded-3xl shadow-2xl border border-[#1e3a8a] p-8 sm:p-10 transition-all text-white relative overflow-hidden">
        
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Encabezado Institucional Oficial con SELLO */}
        <div className="text-center mb-7 relative z-10">
          <div className="flex justify-center mb-3">
            <SelloInstitucional className="w-24 h-24 sm:w-28 sm:h-28 hover:scale-105 transition-transform drop-shadow-xl" />
          </div>
          <span className="text-[10px] text-[#fbbf24] uppercase tracking-widest font-mono font-bold block mb-1">
            Gobierno de Nuevo León • Secretaría de Educación
          </span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Centenaria y Benemérita
          </h1>
          <p className="text-xs sm:text-sm text-[#d6e3ff] font-semibold mt-0.5">
            Escuela Normal "Miguel F. Martínez"
          </p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#112240] text-blue-300 text-[11px] font-mono border border-[#1e3a8a]">
            Sistema Movimiento, Salud y Bienestar (MSB)
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800 text-red-200 rounded-2xl text-xs sm:text-sm flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#d6e3ff] uppercase tracking-wider mb-1.5">
              Nombre de usuario institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo: valeria.solis"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-[#061426] border border-[#1e3a8a] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all font-medium placeholder-[#64748b]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#d6e3ff] uppercase tracking-wider">
                PIN de acceso (6 dígitos)
              </label>
              <span className="text-[10px] text-[#fbbf24] font-mono">SHA-256 Seguro</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 bg-[#061426] border border-[#1e3a8a] rounded-xl text-white text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all font-mono placeholder-[#64748b]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-[#1e3a8a] hover:bg-[#2563eb] text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 border border-[#3b82f6]/40 cursor-pointer"
          >
            {cargando ? (
              <span>Validando credenciales en servidor...</span>
            ) : (
              <>
                <span>Ingresar al Sistema Institucional</span>
                <ArrowRight className="w-4 h-4 text-[#fbbf24]" />
              </>
            )}
          </button>
        </form>

        {/* Access to Register */}
        <div className="mt-5 pt-4 border-t border-[#1e3555] text-center relative z-10">
          <button
            type="button"
            onClick={onIrARegistro}
            className="text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc] transition-colors hover:underline cursor-pointer"
          >
            ¿No tienes cuenta? Crear cuenta institucional
          </button>
        </div>

        {/* Demo Fast Logins for Easy Verification */}
        <div className="mt-6 pt-4 border-t border-dashed border-[#1e3555] relative z-10">
          <div className="flex items-center space-x-1.5 text-xs text-[#94a3b8] font-medium mb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Accesos rápidos de demostración (PIN: 123456):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loginRapido('admin.general', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-amber-200 rounded-xl text-xs font-medium text-center border border-[#f59e0b]/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-[#fbbf24]">Administrador</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">admin.general</div>
              <span className="text-[9px] text-[#fbbf24]/80 block">Consola Total</span>
            </button>

            <button
              type="button"
              onClick={() => loginRapido('encargado.voleibol', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-purple-200 rounded-xl text-xs font-medium text-center border border-purple-400/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-purple-300">Encargado Club</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">encargado.voleibol</div>
              <span className="text-[9px] text-purple-300/80 block">Padrón y 85%</span>
            </button>

            <button
              type="button"
              onClick={() => loginRapido('arthur.music', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-amber-200 rounded-xl text-xs font-medium text-center border border-amber-400/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-amber-300">Jefe Depto. / Admin</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">arthur.music</div>
              <span className="text-[9px] text-amber-300/80 block">Acceso Total</span>
            </button>

            <button
              type="button"
              onClick={() => loginRapido('valeria.solis', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-emerald-200 rounded-xl text-xs font-medium text-center border border-emerald-400/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-emerald-300">Estudiante</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">valeria.solis</div>
              <span className="text-[9px] text-emerald-300/80 block">Asist. 100%</span>
            </button>

            <button
              type="button"
              onClick={() => loginRapido('carlos.ramirez', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-rose-200 rounded-xl text-xs font-medium text-center border border-rose-400/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-rose-300">Trabajador</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">carlos.ramirez</div>
              <span className="text-[9px] text-rose-300/80 block">Asist. 62%</span>
            </button>

            <button
              type="button"
              onClick={() => loginRapido('direccion.enmfm', '123456')}
              className="px-2 py-2 bg-[#112240] hover:bg-[#18315b] text-indigo-200 rounded-xl text-xs font-medium text-center border border-indigo-400/40 transition-colors cursor-pointer"
            >
              <div className="font-bold text-[11px] text-indigo-300">Dirección</div>
              <div className="text-[10px] text-[#94a3b8] truncate font-mono">direccion.enmfm</div>
              <span className="text-[9px] text-indigo-300/80 block">Prioridad 0</span>
            </button>
          </div>
        </div>

        {/* Mención Explícita de Norma ISO de Protección de Datos */}
        <div className="pt-4 border-t border-[#1e3555] text-center relative z-10">
          <button
            type="button"
            onClick={() => setMostrarISOModal(true)}
            className="inline-flex items-center space-x-1.5 text-[11px] text-[#94a3b8] hover:text-[#10b981] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Protección de Datos Personales • Normas ISO/IEC 27701 e ISO/IEC 27001</span>
          </button>
        </div>

      </div>

      {/* Modal Institucional ISO */}
      <PrivacidadISOModal
        abierto={mostrarISOModal}
        onCerrar={() => setMostrarISOModal(false)}
      />

    </div>
  );
};

