'use client'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

type Section = 'personal' | 'banking' | 'security' | 'notifications'

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: 'personal', icon: 'fa-regular fa-user', label: 'Información Personal' },
  { id: 'banking', icon: 'fa-solid fa-building-columns', label: 'Datos Bancarios' },
  { id: 'security', icon: 'fa-solid fa-shield-halved', label: 'Seguridad' },
  { id: 'notifications', icon: 'fa-regular fa-bell', label: 'Notificaciones' },
]

function Toggle({ checked, onChange }: Readonly<{ checked: boolean; onChange: (v: boolean) => void }>) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#0A192F] dark:bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-600'}`}
      title="Toggle"
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState<Section>('personal')
  const [notifs, setNotifs] = useState({
    paymentReminder: true,
    paymentConfirm: true,
    loanStatus: true,
    promotions: false,
    smsAlerts: true,
    smsMovements: true,
    smsSecurity: true,
  })

  if (!user) return null

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100 dark:border-white/6">
        <h1 className="text-3xl font-bold text-[#0A192F] dark:text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Gestiona tu información personal, seguridad y preferencias.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Inner sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 md:sticky md:top-8">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-colors ${activeSection === item.id
                  ? 'bg-[#0A192F]/5 dark:bg-[#00E5FF]/10 text-[#0A192F] dark:text-[#D4AF37]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0F172A] hover:text-[#0A192F] dark:hover:text-white'
                  }`}
              >
                <i className={`${item.icon} w-5 text-center`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="grow space-y-6">

          {/* Personal info */}
          {activeSection === 'personal' && (
            <div className={cardCls}>
              <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-white/6">
                <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Información Personal</h2>
                {/* TODO: Implement edit functionality */}
                <button className="text-sm font-medium text-[#00E5FF] hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors">
                  Editar
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/6">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#0A192F] to-[#00E5FF] flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {user.emailVerified
                        ? <><i className="fa-solid fa-circle-check text-green-500 mr-1" />Email verificado</>
                        : <><i className="fa-solid fa-circle-xmark text-red-500 mr-1" />Email no verificado</>}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Nombre Completo', value: `${user.firstName} ${user.lastName}` },
                    { label: 'Correo Electrónico', value: user.email },
                    /* TODO: Show phone and DNI when available in user profile API */
                    { label: 'Celular', value: 'No disponible' },
                    { label: 'DNI / CE', value: 'No disponible' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        {f.label}
                      </label>
                      <p className="text-gray-800 dark:text-gray-200 font-medium text-sm">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Banking data */}
          {activeSection === 'banking' && (
            <div className={cardCls}>
              <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-white/6">
                <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Datos Bancarios</h2>
                {/* TODO: Implement bank data update */}
                <button className="text-sm font-medium text-[#00E5FF] hover:text-[#0A192F] dark:hover:text-[#D4AF37] transition-colors">
                  Actualizar
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Esta es la cuenta donde depositaremos tus préstamos.
                </p>
                {/* TODO: Show actual bank data from API */}
                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 flex items-center justify-center text-[#0A192F] dark:text-white">
                      <i className="fa-solid fa-building-columns text-xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">
                        Información bancaria
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos bancarios registrados.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                    Pendiente
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className={cardCls}>
              <div className="p-6 border-b border-gray-100 dark:border-white/6">
                <h2 className="text-xl font-bold text-[#0A192F] dark:text-white">Seguridad</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Password */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-white/6">
                  <div>
                    <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">Contraseña</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mantén tu contraseña segura y actualizada</p>
                  </div>
                  {/* TODO: Implement change password flow */}
                  <button className="px-4 py-2 border border-gray-100 dark:border-white/6 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors">
                    Cambiar
                  </button>
                </div>

                {/* Biometric */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-100 dark:border-white/6">
                  <div>
                    <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">Autenticación Biométrica</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {/* TODO: Read actual biometric setting from user profile */}
                      Usa huella o FaceID para acceder
                    </p>
                  </div>
                  <Toggle checked={true} onChange={() => {/* TODO */ }} />
                </div>

                {/* 2FA */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">
                      Autenticación de Dos Factores (2FA)
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {/* TODO: Read and toggle 2FA from user profile API */}
                      Mayor seguridad al iniciar sesión
                    </p>
                  </div>
                  <Toggle checked={false} onChange={() => {/* TODO */ }} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              {/* Email */}
              <div className={cardCls}>
                <div className="p-6 border-b border-gray-100 dark:border-white/6">
                  <h2 className="text-xl font-bold text-[#0A192F] dark:text-white mb-1">Preferencias de Notificación</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {/* TODO: Persist notification preferences via API */}
                    Configura cómo quieres recibir alertas
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Por correo electrónico
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'paymentReminder' as const, label: 'Recordatorio de pago', desc: '7 días antes de tu cuota' },
                      { key: 'paymentConfirm' as const, label: 'Confirmación de pago', desc: 'Al realizarse un pago exitoso' },
                      { key: 'loanStatus' as const, label: 'Estado de solicitud', desc: 'Actualizaciones de tu préstamo' },
                      { key: 'promotions' as const, label: 'Ofertas y promociones', desc: 'Descuentos y nuevos productos' },
                    ].map(item => (
                      <div key={item.key} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                        <div>
                          <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">{item.label}</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={notifs[item.key]}
                          onChange={v => setNotifs(prev => ({ ...prev, [item.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SMS */}
              <div className={cardCls}>
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Por SMS
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'smsAlerts' as const, label: 'Alertas de pago', desc: 'Recordatorio 1 día antes' },
                      { key: 'smsMovements' as const, label: 'Movimientos de cuenta', desc: 'Cada transacción realizada' },
                      { key: 'smsSecurity' as const, label: 'Alertas de seguridad', desc: 'Accesos sospechosos' },
                    ].map(item => (
                      <div key={item.key} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-[#0F172A]">
                        <div>
                          <h4 className="font-semibold text-[#0A192F] dark:text-white text-sm">{item.label}</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle
                          checked={notifs[item.key]}
                          onChange={v => setNotifs(prev => ({ ...prev, [item.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
