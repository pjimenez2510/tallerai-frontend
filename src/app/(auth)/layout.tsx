import { GuestGuard } from '@/components/auth/guest-guard';
import { Wrench, BarChart3, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Wrench,
    title: 'Gestión de OT',
    description: 'Órdenes de trabajo digitales con seguimiento en tiempo real',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Inteligente',
    description: 'Métricas y reportes para tomar mejores decisiones',
  },
  {
    icon: Zap,
    title: 'Diagnóstico con IA',
    description: 'Sugerencias automáticas basadas en historial del vehículo',
  },
  {
    icon: Shield,
    title: 'Multi-tenant Seguro',
    description: 'Datos aislados y protegidos para cada taller',
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="min-h-dvh flex">
        {/* Left panel — branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#0f1f33]">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#f97316] blur-[120px]" />
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[#2563eb] blur-[150px]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  TallerIA
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                  Digitaliza tu taller.
                  <br />
                  <span className="text-[#f97316]">
                    Potencia tu negocio.
                  </span>
                </h2>
                <p className="mt-4 text-lg text-white/60 max-w-md">
                  La plataforma integral para talleres mecánicos en Ecuador.
                  Gestiona órdenes, inventario, clientes y más.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
                  >
                    <feature.icon className="h-5 w-5 text-[#f97316] mb-2" />
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/30">
              © 2026 TallerIA. Hecho en Ecuador.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-secondary)] px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 text-center lg:hidden">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-[var(--color-primary)]">
                  TallerIA
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Sistema de Gestión de Talleres Mecánicos
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
