import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  LogOut,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserCog,
  Banknote,
  Package,
  Tag,
  Wrench,
  CalendarDays,
  Truck,
} from 'lucide-react';

const stats = [
  {
    title: 'Ingresos Totales',
    value: '$45,231',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Usuarios Activos',
    value: '2,350',
    change: '+15.2%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Ventas',
    value: '12,234',
    change: '+4.75%',
    trend: 'up',
    icon: BarChart3,
  },
  {
    title: 'Tasa de Conversión',
    value: '3.2%',
    change: '-1.2%',
    trend: 'down',
    icon: Activity,
  },
];


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Bienvenido, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aquí tienes un resumen de la actividad de tu plataforma.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-primary' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Acciones Rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/companies')}>
              <Users className="h-5 w-5" />
              <span>Compañías</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/operators')}>
              <UserCog className="h-5 w-5" />
              <span>Operadores</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/deposits')}>
              <Banknote className="h-5 w-5" />
              <span>Depósitos</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/products')}>
              <Package className="h-5 w-5" />
              <span>Productos</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/brands')}>
              <Tag className="h-5 w-5" />
              <span>Marcas</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/maintenance-groups')}>
              <Wrench className="h-5 w-5" />
              <span>Grupos Mantenimiento</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/daily-groups')}>
              <CalendarDays className="h-5 w-5" />
              <span>Grupos Diarios</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/suppliers')}>
              <Truck className="h-5 w-5" />
              <span>Proveedores</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <BarChart3 className="h-5 w-5" />
              <span>Ver Reportes</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <DollarSign className="h-5 w-5" />
              <span>Facturación</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Activity className="h-5 w-5" />
              <span>Analíticas</span>
            </Button>
          </div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumen de Ventas
            </CardTitle>
            <CardDescription>
              Ingresos mensuales del último año
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Gráfico de ventas - Integrar con Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
