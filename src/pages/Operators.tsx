import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserCog, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft, Search,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { operatorService } from '@/services/operator.service';
import { Operator } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ─── Schema ───────────────────────────────────────────────────────────────────

const operatorSchema = z.object({
  operatorNumber: z.coerce.number().int().min(1, 'Requerido'),
  firstName:      z.string().min(1, 'Requerido'),
  lastName:       z.string().min(1, 'Requerido'),
  nationalId:     z.string().min(1, 'Requerido'),
  birthDate:      z.string().min(1, 'Requerido'),
  age:            z.string().optional(),
  maritalStatus:  z.string().optional(),
  province:       z.string().optional(),
  mobilePhone1:   z.string().min(1, 'Requerido'),
  mobilePhone2:   z.string().optional(),
  phone1:         z.string().optional(),
  phone2:         z.string().optional(),
  address:        z.string().optional(),
  emergencyContactName:         z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone:        z.string().optional(),
  assignedUnitNumber:  z.string().optional(),
  referenceUnitNumber: z.string().optional(),
  hireDate:            z.string().min(1, 'Requerido'),
  licenseType:         z.string().optional(),
  licenseExpirationDate: z.string().min(1, 'Requerido'),
  status:      z.coerce.number().int(),
  chargeSunday: z.coerce.number().int(),
  term:         z.coerce.number().int().min(0, 'Requerido'),
  userId:       z.string().uuid('UUID inválido'),
});

type OperatorFormData = z.infer<typeof operatorSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
  { value: '2', label: 'Suspendido' },
];

const MARITAL_OPTIONS = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'];
const LICENSE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

function statusBadge(status: number) {
  if (status === 1) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>;
  if (status === 2) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Suspendido</Badge>;
  return <Badge variant="secondary">Inactivo</Badge>;
}

function emptyDefaults(): OperatorFormData {
  return {
    operatorNumber: 0,
    firstName: '', lastName: '', nationalId: '',
    birthDate: '', age: '', maritalStatus: '', province: '',
    mobilePhone1: '', mobilePhone2: '', phone1: '', phone2: '', address: '',
    emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
    assignedUnitNumber: '', referenceUnitNumber: '',
    hireDate: '', licenseType: '', licenseExpirationDate: '',
    status: 1, chargeSunday: 0, term: 0,
    userId: '',
  };
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>
      <Separator className="mt-1" />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Operators() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [operators, setOperators] = useState<Operator[]>([]);
  const [filtered, setFiltered] = useState<Operator[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [deletingOperator, setDeletingOperator] = useState<Operator | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    defaultValues: emptyDefaults(),
  });

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchOperators = async () => {
    try {
      setIsLoading(true);
      const data = await operatorService.getAll();
      setOperators(data ?? []);
      setFiltered(data ?? []);
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Error al cargar los operadores';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOperators(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      operators.filter(
        (o) =>
          `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
          o.nationalId?.toLowerCase().includes(q) ||
          String(o.operatorNumber).includes(q),
      ),
    );
  }, [search, operators]);

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingOperator(null);
    reset(emptyDefaults());
    setIsSheetOpen(true);
  };

  const openEdit = (op: Operator) => {
    setEditingOperator(op);
    reset({
      operatorNumber: op.operatorNumber,
      firstName:  op.firstName,
      lastName:   op.lastName,
      nationalId: op.nationalId,
      birthDate:  op.birthDate?.slice(0, 10) ?? '',
      age:        op.age ?? '',
      maritalStatus: op.maritalStatus ?? '',
      province:   op.province ?? '',
      mobilePhone1: op.mobilePhone1,
      mobilePhone2: op.mobilePhone2 ?? '',
      phone1: op.phone1 ?? '',
      phone2: op.phone2 ?? '',
      address: op.address ?? '',
      emergencyContactName: op.emergencyContactName ?? '',
      emergencyContactRelationship: op.emergencyContactRelationship ?? '',
      emergencyContactPhone: op.emergencyContactPhone ?? '',
      assignedUnitNumber:  op.assignedUnitNumber ?? '',
      referenceUnitNumber: op.referenceUnitNumber ?? '',
      hireDate: op.hireDate?.slice(0, 10) ?? '',
      licenseType: op.licenseType ?? '',
      licenseExpirationDate: op.licenseExpirationDate?.slice(0, 10) ?? '',
      status:       op.status,
      chargeSunday: op.chargeSunday,
      term:         op.term,
      userId:       op.userId,
    });
    setIsSheetOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: OperatorFormData) => {
    setIsSubmitting(true);
    try {
      if (editingOperator) {
        await operatorService.update(editingOperator.id, data);
        toast({ title: 'Operador actualizado', description: `"${data.firstName} ${data.lastName}" fue actualizado.` });
      } else {
        await operatorService.create(data);
        toast({ title: 'Operador creado', description: `"${data.firstName} ${data.lastName}" fue creado.` });
      }
      setIsSheetOpen(false);
      fetchOperators();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Ocurrió un error inesperado';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deletingOperator) return;
    try {
      await operatorService.delete(deletingOperator.id);
      toast({ title: 'Operador eliminado', description: `"${deletingOperator.firstName} ${deletingOperator.lastName}" fue eliminado.` });
      setIsDeleteOpen(false);
      setDeletingOperator(null);
      fetchOperators();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Error al eliminar';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
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
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Operadores</h1>
              <p className="text-sm text-muted-foreground">Gestiona los operadores de la plataforma</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Operador
          </Button>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <CardTitle>Lista de Operadores</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula o #..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <UserCog className="h-10 w-10" />
                <p>{search ? 'Sin resultados para la búsqueda' : 'No hay operadores registrados'}</p>
                {!search && (
                  <Button variant="outline" size="sm" onClick={openCreate} className="gap-1">
                    <Plus className="h-4 w-4" /> Crear el primero
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Nombre completo</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Teléfono móvil</TableHead>
                    <TableHead>Unidad asignada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-mono text-sm">{op.operatorNumber}</TableCell>
                      <TableCell className="font-medium">
                        {op.firstName} {op.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{op.nationalId}</TableCell>
                      <TableCell className="text-muted-foreground">{op.mobilePhone1}</TableCell>
                      <TableCell className="text-muted-foreground">{op.assignedUnitNumber ?? '—'}</TableCell>
                      <TableCell>{statusBadge(op.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(op)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setDeletingOperator(op); setIsDeleteOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ── Create / Edit Sheet ─────────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>
              {editingOperator ? 'Editar Operador' : 'Nuevo Operador'}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <form id="operator-form" onSubmit={handleSubmit(onSubmit)} className="py-6 space-y-6">

              {/* Personal */}
              <section>
                <SectionTitle>Información Personal</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombres *" error={errors.firstName?.message}>
                    <Input placeholder="Juan" {...register('firstName')} />
                  </Field>
                  <Field label="Apellidos *" error={errors.lastName?.message}>
                    <Input placeholder="Pérez" {...register('lastName')} />
                  </Field>
                  <Field label="Cédula / ID Nacional *" error={errors.nationalId?.message}>
                    <Input placeholder="1234567890" {...register('nationalId')} />
                  </Field>
                  <Field label="Fecha de nacimiento *" error={errors.birthDate?.message}>
                    <Input type="date" {...register('birthDate')} />
                  </Field>
                  <Field label="Edad" error={errors.age?.message}>
                    <Input placeholder="30" {...register('age')} />
                  </Field>
                  <Field label="Estado civil" error={errors.maritalStatus?.message}>
                    <Select
                      value={watch('maritalStatus') ?? ''}
                      onValueChange={(v) => setValue('maritalStatus', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_OPTIONS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Provincia" error={errors.province?.message}>
                    <Input placeholder="Pichincha" {...register('province')} />
                  </Field>
                </div>
              </section>

              {/* Contact */}
              <section>
                <SectionTitle>Contacto</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Móvil 1 *" error={errors.mobilePhone1?.message}>
                    <Input placeholder="0991234567" {...register('mobilePhone1')} />
                  </Field>
                  <Field label="Móvil 2" error={errors.mobilePhone2?.message}>
                    <Input placeholder="0991234568" {...register('mobilePhone2')} />
                  </Field>
                  <Field label="Teléfono 1" error={errors.phone1?.message}>
                    <Input placeholder="022345678" {...register('phone1')} />
                  </Field>
                  <Field label="Teléfono 2" error={errors.phone2?.message}>
                    <Input placeholder="022345679" {...register('phone2')} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Dirección" error={errors.address?.message}>
                      <Input placeholder="Av. Principal 123" {...register('address')} />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Emergency */}
              <section>
                <SectionTitle>Contacto de Emergencia</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre" error={errors.emergencyContactName?.message}>
                    <Input placeholder="María Pérez" {...register('emergencyContactName')} />
                  </Field>
                  <Field label="Parentesco" error={errors.emergencyContactRelationship?.message}>
                    <Input placeholder="Cónyuge" {...register('emergencyContactRelationship')} />
                  </Field>
                  <Field label="Teléfono" error={errors.emergencyContactPhone?.message}>
                    <Input placeholder="0991234567" {...register('emergencyContactPhone')} />
                  </Field>
                </div>
              </section>

              {/* Work */}
              <section>
                <SectionTitle>Información Laboral</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="# Operador *" error={errors.operatorNumber?.message}>
                    <Input type="number" min={1} placeholder="1" {...register('operatorNumber')} />
                  </Field>
                  <Field label="Unidad asignada" error={errors.assignedUnitNumber?.message}>
                    <Input placeholder="T-01" {...register('assignedUnitNumber')} />
                  </Field>
                  <Field label="Unidad de referencia" error={errors.referenceUnitNumber?.message}>
                    <Input placeholder="T-00" {...register('referenceUnitNumber')} />
                  </Field>
                  <Field label="Fecha de ingreso *" error={errors.hireDate?.message}>
                    <Input type="date" {...register('hireDate')} />
                  </Field>
                  <Field label="Tipo de licencia" error={errors.licenseType?.message}>
                    <Select
                      value={watch('licenseType') ?? ''}
                      onValueChange={(v) => setValue('licenseType', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_OPTIONS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Vencimiento licencia *" error={errors.licenseExpirationDate?.message}>
                    <Input type="date" {...register('licenseExpirationDate')} />
                  </Field>
                  <Field label="Estado *" error={errors.status?.message}>
                    <Select
                      value={String(watch('status'))}
                      onValueChange={(v) => setValue('status', Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cargo domingo" error={errors.chargeSunday?.message}>
                    <Select
                      value={String(watch('chargeSunday'))}
                      onValueChange={(v) => setValue('chargeSunday', Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Plazo (días)" error={errors.term?.message}>
                    <Input type="number" min={0} placeholder="30" {...register('term')} />
                  </Field>
                </div>
              </section>

              {/* Account */}
              <section>
                <SectionTitle>Cuenta de Usuario</SectionTitle>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="User ID (UUID) *" error={errors.userId?.message}>
                    <Input
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono text-sm"
                      {...register('userId')}
                    />
                  </Field>
                </div>
              </section>

            </form>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end gap-3 bg-background">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form="operator-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Guardando...
                </span>
              ) : editingOperator ? 'Guardar cambios' : 'Crear operador'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar operador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{' '}
              <span className="font-semibold text-foreground">
                "{deletingOperator?.firstName} {deletingOperator?.lastName}"
              </span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
