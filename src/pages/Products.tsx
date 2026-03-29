import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Plus, Pencil, Trash2, LogOut, Zap, ArrowLeft, Search } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/product.service';
import { Product } from '@/types/auth.types';
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

const productSchema = z.object({
  description:          z.string().min(1, 'Requerido'),
  unit:                 z.string().optional(),
  secondaryCode:        z.string().optional(),
  secondaryDescription: z.string().optional(),
  reference:            z.string().optional(),
  classCode:            z.coerce.number().int().min(0, 'Requerido'),
  brandCode:            z.coerce.number().int().min(0, 'Requerido'),
  departmentCode:       z.coerce.number().int().min(0, 'Requerido'),
  manufacturerCode:     z.string().optional(),
  status:               z.coerce.number().int(),
  cost:                 z.coerce.number().min(0, 'Requerido'),
  minimumStock:         z.coerce.number().int().min(0, 'Requerido'),
  maximumStock:         z.coerce.number().int().min(0, 'Requerido'),
});

type ProductFormData = z.infer<typeof productSchema>;

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

function emptyDefaults(): ProductFormData {
  return {
    description: '', unit: '', secondaryCode: '', secondaryDescription: '',
    reference: '', classCode: 0, brandCode: 0, departmentCode: 0,
    manufacturerCode: '', status: 1, cost: 0, minimumStock: 0, maximumStock: 0,
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

export default function Products() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyDefaults(),
  });

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data ?? []);
      setFiltered(data ?? []);
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Error al cargar los productos';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.description?.toLowerCase().includes(q) ||
          p.reference?.toLowerCase().includes(q) ||
          p.manufacturerCode?.toLowerCase().includes(q),
      ),
    );
  }, [search, products]);

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingProduct(null);
    reset(emptyDefaults());
    setIsSheetOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    reset({
      description:          p.description,
      unit:                 p.unit ?? '',
      secondaryCode:        p.secondaryCode ?? '',
      secondaryDescription: p.secondaryDescription ?? '',
      reference:            p.reference ?? '',
      classCode:            p.classCode,
      brandCode:            p.brandCode,
      departmentCode:       p.departmentCode,
      manufacturerCode:     p.manufacturerCode ?? '',
      status:               p.status,
      cost:                 p.cost,
      minimumStock:         p.minimumStock,
      maximumStock:         p.maximumStock,
    });
    setIsSheetOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        toast({ title: 'Producto actualizado', description: `"${data.description}" fue actualizado.` });
      } else {
        await productService.create(data);
        toast({ title: 'Producto creado', description: `"${data.description}" fue creado.` });
      }
      setIsSheetOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? 'Ocurrió un error inesperado';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deletingProduct) return;
    try {
      await productService.delete(deletingProduct.id);
      toast({ title: 'Producto eliminado', description: `"${deletingProduct.description}" fue eliminado.` });
      setIsDeleteOpen(false);
      setDeletingProduct(null);
      fetchProducts();
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Productos</h1>
              <p className="text-sm text-muted-foreground">Gestiona el catálogo de productos</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Lista de Productos</CardTitle>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción o referencia..."
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
                <Package className="h-10 w-10" />
                <p>{search ? 'Sin resultados para la búsqueda' : 'No hay productos registrados'}</p>
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
                    <TableHead>Descripción</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Stock mín.</TableHead>
                    <TableHead className="text-right">Stock máx.</TableHead>
                    <TableHead className="w-28">Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell className="text-muted-foreground">{p.unit ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.reference ?? '—'}</TableCell>
                      <TableCell className="text-right font-mono">${p.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{p.minimumStock}</TableCell>
                      <TableCell className="text-right">{p.maximumStock}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setDeletingProduct(p); setIsDeleteOpen(true); }}
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
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="py-6 space-y-6">

              {/* General */}
              <section>
                <SectionTitle>Información General</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Descripción *" error={errors.description?.message}>
                      <Input placeholder="Nombre del producto" {...register('description')} />
                    </Field>
                  </div>
                  <Field label="Descripción secundaria" error={errors.secondaryDescription?.message}>
                    <Input placeholder="Descripción alternativa" {...register('secondaryDescription')} />
                  </Field>
                  <Field label="Unidad" error={errors.unit?.message}>
                    <Input placeholder="Ej: UND, KG, LT" {...register('unit')} />
                  </Field>
                  <Field label="Referencia" error={errors.reference?.message}>
                    <Input placeholder="REF-001" {...register('reference')} />
                  </Field>
                  <Field label="Código secundario" error={errors.secondaryCode?.message}>
                    <Input placeholder="COD-SEC" {...register('secondaryCode')} />
                  </Field>
                  <Field label="Código fabricante" error={errors.manufacturerCode?.message}>
                    <Input placeholder="FAB-001" {...register('manufacturerCode')} />
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
                </div>
              </section>

              {/* Clasificación */}
              <section>
                <SectionTitle>Clasificación</SectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Código clase *" error={errors.classCode?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('classCode')} />
                  </Field>
                  <Field label="Código marca *" error={errors.brandCode?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('brandCode')} />
                  </Field>
                  <Field label="Código depto. *" error={errors.departmentCode?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('departmentCode')} />
                  </Field>
                </div>
              </section>

              {/* Precios y Stock */}
              <section>
                <SectionTitle>Precios y Stock</SectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Costo *" error={errors.cost?.message}>
                    <Input type="number" min={0} step="0.01" placeholder="0.00" {...register('cost')} />
                  </Field>
                  <Field label="Stock mínimo *" error={errors.minimumStock?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('minimumStock')} />
                  </Field>
                  <Field label="Stock máximo *" error={errors.maximumStock?.message}>
                    <Input type="number" min={0} placeholder="0" {...register('maximumStock')} />
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
            <Button type="submit" form="product-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Guardando...
                </span>
              ) : editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente{' '}
              <span className="font-semibold text-foreground">"{deletingProduct?.description}"</span>.
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
