'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  Car,
  ClipboardList,
  Pencil,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClientFormDialog } from './client-form-dialog';
import { clientsApi } from '@/lib/api/clients';
import { vehiclesApi } from '@/lib/api/vehicles';
import { useWorkOrdersByClient } from '@/hooks/use-work-orders';

const docTypeLabels: Record<string, string> = {
  cedula: 'Cédula',
  ruc: 'RUC',
  pasaporte: 'Pasaporte',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  recepcion: { label: 'Recepción', color: 'text-slate-700', bg: 'bg-slate-100' },
  diagnostico: { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-100' },
  aprobado: { label: 'Aprobado', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  en_progreso: { label: 'En Progreso', color: 'text-amber-700', bg: 'bg-amber-100' },
  completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
};

type TabType = 'vehiculos' | 'ordenes';

interface ClientDetailContentProps {
  clientId: string;
}

export function ClientDetailContent({ clientId }: ClientDetailContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('vehiculos');
  const [editOpen, setEditOpen] = useState(false);

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      const response = await clientsApi.getById(clientId);
      return response.data;
    },
    enabled: !!clientId,
  });

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', 'by-client', clientId],
    queryFn: async () => {
      const response = await vehiclesApi.getByClient(clientId);
      return response.data;
    },
    enabled: !!clientId,
  });

  const { data: workOrders, isLoading: loadingOrders } = useWorkOrdersByClient(clientId);

  if (loadingClient) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Cliente no encontrado</p>
        <Button
          variant="link"
          onClick={() => router.push('/clients')}
          className="mt-2 text-[#f97316]"
        >
          Volver a Clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push('/clients')}
          className="rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {client.name}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {docTypeLabels[client.documentType]}: {client.documentNumber}
          </p>
        </div>
        <Button
          onClick={() => setEditOpen(true)}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-xl font-bold text-white uppercase">
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {client.name}
            </h2>
            <Badge variant="secondary" className="text-[10px] font-medium mt-0.5">
              {docTypeLabels[client.documentType]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={<FileText className="h-4 w-4" />}
            label="Documento"
            value={client.documentNumber}
          />
          {client.email && (
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={client.email}
            />
          )}
          {client.phone && (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Teléfono"
              value={client.phone}
            />
          )}
          {client.phoneSecondary && (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Tel. secundario"
              value={client.phoneSecondary}
            />
          )}
          {client.address && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Dirección"
              value={client.address}
            />
          )}
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Registrado"
            value={new Date(client.createdAt).toLocaleDateString('es-EC')}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <div className="flex border-b border-[var(--color-border)]">
          <TabButton
            active={activeTab === 'vehiculos'}
            onClick={() => setActiveTab('vehiculos')}
            icon={<Car className="h-4 w-4" />}
            label="Vehículos"
            count={vehicles?.length}
          />
          <TabButton
            active={activeTab === 'ordenes'}
            onClick={() => setActiveTab('ordenes')}
            icon={<ClipboardList className="h-4 w-4" />}
            label="Órdenes de Trabajo"
            count={workOrders?.length}
          />
        </div>

        <div className="p-4">
          {activeTab === 'vehiculos' && (
            <VehiclesTab vehicles={vehicles ?? []} loading={loadingVehicles} />
          )}
          {activeTab === 'ordenes' && (
            <WorkOrdersTab
              workOrders={workOrders ?? []}
              loading={loadingOrders}
              onClickOrder={(id) => router.push(`/work-orders?id=${id}`)}
            />
          )}
        </div>
      </div>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[var(--color-bg-secondary)] px-4 py-3">
      <span className="text-[var(--color-text-secondary)] mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-[#1e3a5f] text-[#1e3a5f]'
          : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
            active
              ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function VehiclesTab({
  vehicles,
  loading,
}: {
  vehicles: import('@/types/vehicle.types').Vehicle[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-10">
        <Car className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Este cliente no tiene vehículos registrados
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
            <TableHead className="font-semibold">Placa</TableHead>
            <TableHead className="font-semibold">Vehículo</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Año</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">Km</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id} className="hover:bg-[var(--color-bg-secondary)]/50">
              <TableCell>
                <Badge variant="outline" className="font-mono font-bold">
                  {v.plate}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {v.brand} {v.model}
                </p>
                {v.color && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {v.color}
                  </p>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-[var(--color-text-secondary)]">
                {v.year}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-[var(--color-text-secondary)]">
                {v.mileage.toLocaleString()} km
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function WorkOrdersTab({
  workOrders,
  loading,
  onClickOrder,
}: {
  workOrders: import('@/types/work-order.types').WorkOrder[];
  loading: boolean;
  onClickOrder: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-10">
        <ClipboardList className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Este cliente no tiene órdenes de trabajo
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
            <TableHead className="font-semibold">OT</TableHead>
            <TableHead className="font-semibold">Vehículo</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Estado</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => {
            const status = statusConfig[wo.status];
            return (
              <TableRow
                key={wo.id}
                className="cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                onClick={() => onClickOrder(wo.id)}
              >
                <TableCell>
                  <span className="font-mono font-bold text-[var(--color-text-primary)]">
                    {wo.orderNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {wo.vehiclePlate}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {wo.vehicleDescription}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {status && (
                    <Badge className={`${status.bg} ${status.color} hover:${status.bg} text-[10px]`}>
                      {status.label}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-[var(--color-text-secondary)]">
                  {new Date(wo.createdAt).toLocaleDateString('es-EC')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
