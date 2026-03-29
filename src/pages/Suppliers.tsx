import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft, Search } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supplierService } from '@/services/supplier.service';
import { Supplier } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const schema = z.object({
  name:           z.string().min(1, 'Requerido'),
  taxId:          z.string().optional(),
  address:        z.string().optional(),
  representative: z.string().optional(),
  status:         z.coerce.number().int(),
  phone:          z.string().optional(),
  country:        z.string().optional(),
  email:          z.string().email('Email inválido').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }];

function statusBadge(status: number) {
  return status === 1
    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    : <Badge variant="secondary">Inactivo</Badge>;
}

const empty: FormData = { name: '', taxId: '', address: '', representative: '', status: 1, phone: '', country: '', email: '' };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function Suppliers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<Supplier[]>([]);
  const [filtered, setFiltered] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: empty,
  });

  const fetch = async () => {
    try {
      setIsLoading(true);
      const data = (await supplierService.getAll()) ?? [];
      setItems(data); setFiltered(data);
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error al cargar', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter((s) =>
      s.name?.toLowerCase().includes(q) ||
      s.taxId?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q),
    ));
  }, [search, items]);

  const openCreate = () => { setEditing(null); reset(empty); setIsDialogOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    reset({ name: s.name, taxId: s.taxId ?? '', address: s.address ?? '', representative: s.representative ?? '', status: s.status, phone: s.phone ?? '', country: s.country ?? '', email: s.email ?? '' });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await supplierService.update(editing.id, data);
        toast({ title: 'Proveedor actualizado', description: `"${data.name}" fue actualizado.` });
      } else {
        await supplierService.create(data);
        toast({ title: 'Proveedor creado', description: `"${data.name}" fue creado.` });
      }
      setIsDialogOpen(false); fetch();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error inesperado', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await supplierService.delete(deleting.id);
      toast({ title: 'Proveedor eliminado', description: `"${deleting.name}" fue eliminado.` });
      setIsDeleteOpen(false); setDeleting(null); fetch();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error al eliminar', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Proveedores</h1>
              <p className="text-sm text-muted-foreground">Gestiona los proveedores de la plataforma</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nuevo Proveedor</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Lista de Proveedores</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, RUC o email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Truck className="h-10 w-10" />
                <p>{search ? 'Sin resultados para la búsqueda' : 'No hay proveedores registrados'}</p>
                {!search && <Button variant="outline" size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" />Crear el primero</Button>}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUC / NIT</TableHead>
                    <TableHead>Representante</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.taxId ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{s.representative ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{s.phone ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{s.country ?? '—'}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setDeleting(s); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="py-5 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Información General</p>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="Nombre *" error={errors.name?.message}>
                      <Input placeholder="Nombre del proveedor" {...register('name')} />
                    </Field>
                  </div>
                  <Field label="RUC / NIT" error={errors.taxId?.message}>
                    <Input placeholder="1234567890001" {...register('taxId')} />
                  </Field>
                  <Field label="País" error={errors.country?.message}>
                    <Input placeholder="Ecuador" {...register('country')} />
                  </Field>
                  <Field label="Estado *" error={errors.status?.message}>
                    <Select value={String(watch('status'))} onValueChange={(v) => setValue('status', Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Representante" error={errors.representative?.message}>
                    <Input placeholder="Nombre del representante" {...register('representative')} />
                  </Field>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contacto</p>
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono" error={errors.phone?.message}>
                    <Input placeholder="0991234567" {...register('phone')} />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input type="email" placeholder="contacto@empresa.com" {...register('email')} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Dirección" error={errors.address?.message}>
                      <Input placeholder="Av. Principal 123" {...register('address')} />
                    </Field>
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>
          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="supplier-form" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Guardando...</span> : editing ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará <span className="font-semibold text-foreground">"{deleting?.name}"</span>.</AlertDialogDescription>
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
