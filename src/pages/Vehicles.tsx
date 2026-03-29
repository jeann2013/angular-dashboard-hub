import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft, Search } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicle.service';
import { maintenanceGroupService } from '@/services/maintenance-group.service';
import { dailyGroupService } from '@/services/daily-group.service';
import { Vehicle, MaintenanceGroup, DailyGroup } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  unitNumber:          z.string().min(1, 'Requerido'),
  companyCode:         z.coerce.number().int().min(0),
  licensePlate:        z.string().min(1, 'Requerido'),
  year:                z.string().optional(),
  brand:               z.string().optional(),
  model:               z.string().optional(),
  chassisNumber:       z.string().optional(),
  engineSerial:        z.string().optional(),
  quotaNumber:         z.string().optional(),
  quotaDate:           z.string().min(1, 'Requerido'),
  policyNumber:        z.string().optional(),
  policyDate:          z.string().min(1, 'Requerido'),
  purchaseDate:        z.string().min(1, 'Requerido'),
  inspectionDate:      z.string().min(1, 'Requerido'),
  assignedTechnician:  z.string().optional(),
  status:              z.coerce.number().int(),
  gpsNumber:           z.string().optional(),
  radioNumber:         z.string().optional(),
  date:                z.string().min(1, 'Requerido'),
  maintenanceGroupId:  z.string().uuid('Seleccione un grupo de mantenimiento'),
  dailyGroupId:        z.string().uuid('Seleccione un grupo diario'),
  dailyAmount:         z.coerce.number().min(0),
  mileage:             z.coerce.number().int().min(0),
  operatorNumber:      z.coerce.number().int().optional().nullable(),
  financed:            z.coerce.number().int(),
  ignitionStatus:      z.string().optional(),
  charge:              z.coerce.number().int().min(0),
  installments:        z.coerce.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
  { value: '2', label: 'En mantenimiento' },
];

function statusBadge(s: number) {
  if (s === 1) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>;
  if (s === 2) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Mantenimiento</Badge>;
  return <Badge variant="secondary">Inactivo</Badge>;
}

function today() { return new Date().toISOString().slice(0, 10); }

function emptyDefaults(): FormData {
  return {
    unitNumber: '', companyCode: 0, licensePlate: '',
    year: '', brand: '', model: '', chassisNumber: '', engineSerial: '',
    quotaNumber: '', quotaDate: today(), policyNumber: '', policyDate: today(),
    purchaseDate: today(), inspectionDate: today(),
    assignedTechnician: '', status: 1, gpsNumber: '', radioNumber: '',
    date: today(), maintenanceGroupId: '', dailyGroupId: '',
    dailyAmount: 0, mileage: 0, operatorNumber: null,
    financed: 0, ignitionStatus: '', charge: 0, installments: 0,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>
      <Separator className="mt-1" />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Vehicles() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filtered, setFiltered] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [maintenanceGroups, setMaintenanceGroups] = useState<MaintenanceGroup[]>([]);
  const [dailyGroups, setDailyGroups] = useState<DailyGroup[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults(),
  });

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = (await vehicleService.getAll()) ?? [];
      setVehicles(data);
      setFiltered(data);
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error al cargar vehículos', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const loadDropdowns = async () => {
    try {
      const [mg, dg] = await Promise.all([
        maintenanceGroupService.getAll(),
        dailyGroupService.getAll(),
      ]);
      setMaintenanceGroups(mg ?? []);
      setDailyGroups(dg ?? []);
    } catch { /* silencioso */ }
  };

  useEffect(() => { fetchVehicles(); loadDropdowns(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(vehicles.filter((v) =>
      v.unitNumber?.toLowerCase().includes(q) ||
      v.licensePlate?.toLowerCase().includes(q) ||
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q),
    ));
  }, [search, vehicles]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    reset(emptyDefaults());
    setIsSheetOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    reset({
      unitNumber: v.unitNumber, companyCode: v.companyCode, licensePlate: v.licensePlate,
      year: v.year ?? '', brand: v.brand ?? '', model: v.model ?? '',
      chassisNumber: v.chassisNumber ?? '', engineSerial: v.engineSerial ?? '',
      quotaNumber: v.quotaNumber ?? '', quotaDate: v.quotaDate?.slice(0, 10) ?? today(),
      policyNumber: v.policyNumber ?? '', policyDate: v.policyDate?.slice(0, 10) ?? today(),
      purchaseDate: v.purchaseDate?.slice(0, 10) ?? today(),
      inspectionDate: v.inspectionDate?.slice(0, 10) ?? today(),
      assignedTechnician: v.assignedTechnician ?? '', status: v.status,
      gpsNumber: v.gpsNumber ?? '', radioNumber: v.radioNumber ?? '',
      date: v.date?.slice(0, 10) ?? today(),
      maintenanceGroupId: v.maintenanceGroupId, dailyGroupId: v.dailyGroupId,
      dailyAmount: v.dailyAmount, mileage: v.mileage,
      operatorNumber: v.operatorNumber ?? null,
      financed: v.financed, ignitionStatus: v.ignitionStatus ?? '',
      charge: v.charge, installments: v.installments,
    });
    setIsSheetOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await vehicleService.update(editing.id, data);
        toast({ title: 'Vehículo actualizado', description: `Unidad "${data.unitNumber}" fue actualizada.` });
      } else {
        await vehicleService.create(data);
        toast({ title: 'Vehículo creado', description: `Unidad "${data.unitNumber}" fue creada.` });
      }
      setIsSheetOpen(false);
      fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error inesperado', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await vehicleService.delete(deleting.id);
      toast({ title: 'Vehículo eliminado', description: `Unidad "${deleting.unitNumber}" fue eliminada.` });
      setIsDeleteOpen(false); setDeleting(null); fetchVehicles();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error al eliminar', variant: 'destructive' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EasyPay</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" onClick={logout}><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Vehículos</h1>
              <p className="text-sm text-muted-foreground">Gestiona la flota de vehículos</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nuevo Vehículo</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle>Flota de Vehículos</CardTitle>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por unidad, placa, marca..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Car className="h-10 w-10" />
                <p>{search ? 'Sin resultados para la búsqueda' : 'No hay vehículos registrados'}</p>
                {!search && <Button variant="outline" size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" />Crear el primero</Button>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca / Modelo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Grupo Mant.</TableHead>
                      <TableHead>Grupo Diario</TableHead>
                      <TableHead className="text-right">Km</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[100px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono font-medium">{v.unitNumber}</TableCell>
                        <TableCell>{v.licensePlate}</TableCell>
                        <TableCell>{[v.brand, v.model].filter(Boolean).join(' ') || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{v.year ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{v.maintenanceGroupDescription ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{v.dailyGroupDescription ?? '—'}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{v.mileage.toLocaleString()}</TableCell>
                        <TableCell>{statusBadge(v.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setDeleting(v); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ── Sheet ───────────────────────────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>{editing ? 'Editar Vehículo' : 'Nuevo Vehículo'}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="py-6 space-y-6">

              {/* Identificación */}
              <section>
                <SectionTitle>Identificación</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="# Unidad *" error={errors.unitNumber?.message}>
                    <Input placeholder="T-01" {...register('unitNumber')} />
                  </Field>
                  <Field label="Placa *" error={errors.licensePlate?.message}>
                    <Input placeholder="ABC-1234" {...register('licensePlate')} />
                  </Field>
                  <Field label="Marca" error={errors.brand?.message}>
                    <Input placeholder="Toyota" {...register('brand')} />
                  </Field>
                  <Field label="Modelo" error={errors.model?.message}>
                    <Input placeholder="Corolla" {...register('model')} />
                  </Field>
                  <Field label="Año" error={errors.year?.message}>
                    <Input placeholder="2022" {...register('year')} />
                  </Field>
                  <Field label="Código compañía *" error={errors.companyCode?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('companyCode')} />
                  </Field>
                  <Field label="Estado *" error={errors.status?.message}>
                    <Select value={String(watch('status'))} onValueChange={(v) => setValue('status', Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
              </section>

              {/* Datos técnicos */}
              <section>
                <SectionTitle>Datos Técnicos</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="N° Chasis" error={errors.chassisNumber?.message}>
                    <Input placeholder="JTDBR32E010..." {...register('chassisNumber')} />
                  </Field>
                  <Field label="N° Motor" error={errors.engineSerial?.message}>
                    <Input placeholder="2ZR-FE..." {...register('engineSerial')} />
                  </Field>
                  <Field label="GPS" error={errors.gpsNumber?.message}>
                    <Input placeholder="GPS-001" {...register('gpsNumber')} />
                  </Field>
                  <Field label="Radio" error={errors.radioNumber?.message}>
                    <Input placeholder="RAD-001" {...register('radioNumber')} />
                  </Field>
                  <Field label="Kilometraje *" error={errors.mileage?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('mileage')} />
                  </Field>
                  <Field label="Estado encendido" error={errors.ignitionStatus?.message}>
                    <Input placeholder="ON / OFF" {...register('ignitionStatus')} />
                  </Field>
                  <Field label="Técnico asignado" error={errors.assignedTechnician?.message}>
                    <Input placeholder="Nombre del técnico" {...register('assignedTechnician')} />
                  </Field>
                </div>
              </section>

              {/* Asignación */}
              <section>
                <SectionTitle>Asignación</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Grupo de mantenimiento *" error={errors.maintenanceGroupId?.message}>
                    <Select value={watch('maintenanceGroupId') ?? ''} onValueChange={(v) => setValue('maintenanceGroupId', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar grupo..." /></SelectTrigger>
                      <SelectContent>
                        {maintenanceGroups.map((mg) => (
                          <SelectItem key={mg.id} value={mg.id}>{mg.description}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Grupo diario *" error={errors.dailyGroupId?.message}>
                    <Select value={watch('dailyGroupId') ?? ''} onValueChange={(v) => setValue('dailyGroupId', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar grupo..." /></SelectTrigger>
                      <SelectContent>
                        {dailyGroups.map((dg) => (
                          <SelectItem key={dg.id} value={dg.id}>{dg.description}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Monto diario *" error={errors.dailyAmount?.message}>
                    <Input type="number" step="0.01" min={0} placeholder="0.00" {...register('dailyAmount')} />
                  </Field>
                  <Field label="# Operador" error={errors.operatorNumber?.message}>
                    <Input type="number" min={0} placeholder="Opcional" {...register('operatorNumber')} />
                  </Field>
                </div>
              </section>

              {/* Documentos y fechas */}
              <section>
                <SectionTitle>Documentos y Fechas</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="N° Cuota" error={errors.quotaNumber?.message}>
                    <Input placeholder="CUO-001" {...register('quotaNumber')} />
                  </Field>
                  <Field label="Fecha cuota *" error={errors.quotaDate?.message}>
                    <Input type="date" {...register('quotaDate')} />
                  </Field>
                  <Field label="N° Póliza" error={errors.policyNumber?.message}>
                    <Input placeholder="POL-001" {...register('policyNumber')} />
                  </Field>
                  <Field label="Fecha póliza *" error={errors.policyDate?.message}>
                    <Input type="date" {...register('policyDate')} />
                  </Field>
                  <Field label="Fecha compra *" error={errors.purchaseDate?.message}>
                    <Input type="date" {...register('purchaseDate')} />
                  </Field>
                  <Field label="Fecha inspección *" error={errors.inspectionDate?.message}>
                    <Input type="date" {...register('inspectionDate')} />
                  </Field>
                  <Field label="Fecha registro *" error={errors.date?.message}>
                    <Input type="date" {...register('date')} />
                  </Field>
                </div>
              </section>

              {/* Configuración financiera */}
              <section>
                <SectionTitle>Configuración Financiera</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Financiado" error={errors.financed?.message}>
                    <Select value={String(watch('financed'))} onValueChange={(v) => setValue('financed', Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cargo *" error={errors.charge?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('charge')} />
                  </Field>
                  <Field label="Cuotas *" error={errors.installments?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('installments')} />
                  </Field>
                </div>
              </section>

            </form>
          </ScrollArea>

          <div className="border-t px-6 py-4 flex justify-end gap-3 bg-background">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="vehicle-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Guardando...
                </span>
              ) : editing ? 'Guardar cambios' : 'Crear vehículo'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la unidad{' '}
              <span className="font-semibold text-foreground">"{deleting?.unitNumber} — {deleting?.licensePlate}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
