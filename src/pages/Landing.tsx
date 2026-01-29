import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Users,
  Lock
} from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const features = [
  {
    icon: BarChart3,
    title: 'Analíticas Avanzadas',
    description: 'Visualiza tus datos en tiempo real con dashboards interactivos.',
  },
  {
    icon: Shield,
    title: 'Seguridad Empresarial',
    description: 'Autenticación JWT y protección de datos de nivel empresarial.',
  },
  {
    icon: Zap,
    title: 'Rendimiento Óptimo',
    description: 'Arquitectura optimizada para máxima velocidad y eficiencia.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '10k+', label: 'Usuarios' },
  { value: '50+', label: 'Países' },
  { value: '24/7', label: 'Soporte' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SolarApp</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/login">
              <Button variant="default">Comenzar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Arquitectura desacoplada con React + JWT
              </span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Potencia tu negocio con{' '}
              <span className="text-primary">SolarApp</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Plataforma empresarial con autenticación segura, dashboard 
              interactivo y arquitectura moderna para escalar tu negocio.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button variant="hero" size="xl">
                  Comenzar Ahora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="heroOutline" size="xl">
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Características Principales
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Todo lo que necesitas para gestionar tu negocio de manera eficiente.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <div className="mb-6 flex -space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-secondary">
                <Lock className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              ¿Listo para comenzar?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Únete a miles de empresas que ya confían en nuestra plataforma.
            </p>
            <Link to="/login">
              <Button variant="hero" size="xl">
                Crear Cuenta Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 SolarApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
