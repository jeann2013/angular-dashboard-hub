import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { depositService } from '@/services/deposit.service';
import { Deposit } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

// ─── Schema ───────────────────────────────────────────────────────────────────

const depositSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  status: z.coerce.number().int(),
});

type DepositFormData = z.infer<typeof depositSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

function statusBadge(status: number) {
  return status === 1
    ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    : <Badge variant="secondary">Inactivo</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Deposits() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [deletingDeposit, setDeletingDeposit] = useState<Deposit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: { description: '', status: 1 },
  });

  const fetchDeposits = async () => {
    try {
      setIsLoading(true);
      const data = await depositService.getAll();
      setDeposits(data ?? []);
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Error al cargar los depósitos';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const openCreate = () => {
    setEditingDeposit(null);
    reset({ description: '', status: 1 });
    setIsDialogOpen(true);
  };

  const openEdit = (d: Deposit) => {
    setEditingDeposit(d);
    reset({ description: d.description, status: d.status });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: DepositFormData) => {
    setIsSubmitting(true);
    try {
      if (editingDeposit) {
        await depositService.update(editingDeposit.id, data);
        toast({ title: 'Depósito actualizado', description: `"${data.description}" fue actualizado.` });
      } else {
        await depositService.create(data);
        toast({ title: 'Depósito creado', description: `"${data.description}" fue creado.` });
      }
      setIsDialogOpen(false);
      fetchDeposits();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Ocurrió un error inesperado';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deletingDeposit) return;
    try {
      await depositService.delete(deletingDeposit.id);
      toast({ title: 'Depósito eliminado', description: `"${deletingDeposit.description}" fue eliminado.` });
      setIsDeleteOpen(false);
      setDeletingDeposit(null);
      fetchDeposits();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Error al eliminar';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Depósitos</h1>
              <p className="text-sm text-muted-foreground">Gestiona los depósitos de la plataforma</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Depósito
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Banknote className="h-5 w-5 text-primary" />
            <CardTitle>Lista de Depósitos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : deposits.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Banknote className="h-10 w-10" />
                <p>No hay depósitos registrados</p>
                <Button variant="outline" size="sm" onClick={openCreate} className="gap-1">
                  <Plus className="h-4 w-4" /> Crear el primero
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-32">Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.description}</TableCell>
                      <TableCell>{statusBadge(d.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setDeletingDeposit(d); setIsDeleteOpen(true); }}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDeposit ? 'Editar Depósito' : 'Nuevo Depósito'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input id="description" placeholder="Descripción del depósito" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Estado *</Label>
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
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Guardando...
                  </span>
                ) : editingDeposit ? 'Guardar cambios' : 'Crear depósito'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar depósito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
              <span className="font-semibold text-foreground">"{deletingDeposit?.description}"</span>.
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
