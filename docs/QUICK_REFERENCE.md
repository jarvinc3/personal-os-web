# 🚀 Quick Reference Guide

Guía rápida de consulta.

## 📋 Crear un Formulario

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema } from '@/lib/schemas';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', price: 0 }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <HugeiconsIcon icon={FirstBracketIcon} />
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## 🎨 Componentes Comunes

```typescript
// Card
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>

// Button variants
import { Button } from '@/components/ui/button';
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>

// Dialog vs Drawer (prefer Drawer for details)
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
<Drawer open={isOpen} onOpenChange={setIsOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Título</DrawerTitle>
    </DrawerHeader>
    {/* Content */}
  </DrawerContent>
</Drawer>

// Badge
import { Badge } from '@/components/ui/badge';
<Badge>Label</Badge>
<Badge variant="secondary">Secondary</Badge>

// Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona..." />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
  </SelectContent>
</Select>

// Spinner
import { Spinner } from '@/components/ui/spinner';
<Button disabled>
  <Spinner className="w-4 h-4 mr-2" />
  Cargando...
</Button>

// Toast notification
import { toast } from 'sonner';
toast.success('Éxito');
toast.error('Error');
toast.loading('Cargando...');
```

## 🛠️ Servicios

```typescript
// Usar servicio en hooks con react query
import { AuthService } from '@/lib/services';

const user = await AuthService.login(email, password);

// Luego usar hooks en componentes
const { user, login } = useAuthStore();
await login(email, password);
```

## 📝 Crear un Servicio

```typescript
import { BaseRepository } from './base.repository';
import { MyEntity } from '@/lib/types';

export class MyService extends BaseRepository<MyEntity> {
  constructor() {
    super('my-endpoint');
  }

  async customMethod(param: string) {
    // Custom logic
  }
}

export const myService = new MyService();
```

## ✅ Validación con Zod

```typescript
import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  price: z.number().min(0, 'Debe ser >= 0'),
  duration: z.number().min(15, 'Mínimo 15 minutos'),
});

type Service = z.infer<typeof serviceSchema>;
```

## 🎯 Patrones Comunes

### Manejo de Errores

```typescript
try {
  await createService(data);
  toast.success('Creado exitosamente');
} catch (error) {
  toast.error('Error al crear');
  console.error(error);
}
```

### Carga de Datos

```typescript
if (isLoading) return <div>Cargando...</div>;
if (error) return <div>Error</div>;
return <div>{/* Contenido */}</div>;
```

### Confirmación de Eliminación

```typescript
const [deleteId, setDeleteId] = useState(null);

<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

### Drawer para Formulario

```typescript
const [isOpen, setIsOpen] = useState(false);

<Drawer open={isOpen} onOpenChange={setIsOpen}>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Nuevo</DrawerTitle>
    </DrawerHeader>
    <MyForm onSuccess={() => setIsOpen(false)} />
  </DrawerContent>
</Drawer>
```

## 🔧 Utility Functions

```typescript
import { formatDate, formatTime, formatDuration, formatRelative } from '@/src/shared/lib/format';

formatDate('2026-03-17') // "17 Mar 2026"
formatTime('2026-03-17T14:30:00') // "14:30"
formatDuration(30) // "30m"
formatDuration(90) // "1h 30m"
formatRelative('2026-03-17T14:30:00') // "en 2 días"

import { cn } from '@/lib/utils';
cn('px-4', condition && 'bg-primary') // Merge classes
```

## 📦 Importar Componentes UI

```typescript
// Automático con shadcn CLI:
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
```

## 🐛 Debug

```typescript
// Logging
console.log('[v0] Debug:', variable);

// React DevTools
// Instalar extensión Chrome "React Developer Tools"

// Performance
// Usar React DevTools → Profiler

// Network
// F12 → Network → Ver requests
```

## 🎨 Colores y Tokens

```css
/* CSS Variables en globals.css */
--background: Color de fondo
--foreground: Color de texto principal
--primary: Color primario (Negro)
--primary-foreground: Texto sobre primario
--secondary: Color secundario (Grises)
--muted: Color neutro
--destructive: Rojo para acciones destructivas
--border: Color de bordes
--input: Color de inputs
```

## 🔗 Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [React Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Sonner](https://sonner.emilkowal.ski)

---

**Última actualización:** Abril 2026
