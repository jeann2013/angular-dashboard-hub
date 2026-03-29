import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wrench, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { maintenanceGroupService } from '@/services/maintenance-group.service';
import { MaintenanceGroup } from '@/types/auth.types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({ description: z.string().min(1, 'La descripción es requerida') });
type FormData = z.infer<typeof schema>;

export default function MaintenanceGroups() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<MaintenanceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceGroup | null>(null);
  const [deleting, setDeleting] = useState<MaintenanceGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetch = async () => {
    try {
      setIsLoading(true);
      setItems((await maintenanceGroupService.getAll()) ?? []);
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error al cargar', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); reset({ description: '' }); setIsDialogOpen(true); };
  const openEdit = (m: MaintenanceGroup) => { setEditing(m); reset({ description: m.description }); setIsDialogOpen(true); };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (editing) {
        await maintenanceGroupService.update(editing.id, data);
        toast({ title: 'Grupo actualizado', description: `"${data.description}" fue actualizado.` });
      } else {
        await maintenanceGroupService.create(data);
        toast({ title: 'Grupo creado', description: `"${data.description}" fue creado.` });
      }
      setIsDialogOpen(false); fetch();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as { message?: string })?.message ?? 'Error inesperado', variant: 'destructive' });
    } finally { setIsSubmitting(false); }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await maintenanceGroupService.delete(deleting.id);
      toast({ title: 'Grupo eliminado', description: `"${deleting.description}" fue eliminado.` });
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
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Grupos de Mantenimiento</h1>
              <p className="text-sm text-muted-foreground">Gestiona los grupos de mantenimiento</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nuevo Grupo</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle>Lista de Grupos de Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Wrench className="h-10 w-10" />
                <p>No hay grupos registrados</p>
                <Button variant="outline" size="sm" onClick={openCreate} className="gap-1"><Plus className="h-4 w-4" />Crear el primero</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setDeleting(m); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar Grupo' : 'Nuevo Grupo de Mantenimiento'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input id="description" placeholder="Nombre del grupo" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Guardando...</span> : editing ? 'Guardar cambios' : 'Crear grupo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará <span className="font-semibold text-foreground">"{deleting?.description}"</span>.</AlertDialogDescription>
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
