

# MentorHub — MVP Completo Mínimo (Sin Landing)

Plataforma de mentorías y formaciones online en español, con diseño premium estilo Mindvalley (dark theme con acentos violeta/púrpura).

> **Nota:** Lovable usa React + Vite (no Next.js). El routing se maneja con React Router y la protección de rutas se hace client-side con Supabase Auth.

---

## 1. Base de datos en Supabase

Crear todas las tablas necesarias para el MVP con RLS habilitado:

- **Roles**: Tabla `user_roles` con enum `(admin, mentor, alumno, finanzas)` y función `has_role()` como security definer
- **profiles**: datos extendidos del usuario (nombre, apellido, avatar, bio, especialidad, redes sociales)
- **mentores**: perfil de mentor (descripción, categorías, precio suscripción, featured)
- **cursos**: título, descripción, imagen, precio, categoría, estado, si está incluido en suscripción
- **modulos** y **lecciones**: estructura de contenido con orden y tipo (video, PDF, texto)
- **inscripciones**: alumno ↔ curso
- **suscripciones_mentor**: alumno ↔ mentor con estado y fechas
- **notificaciones**: sistema de notificaciones por usuario

Las tablas de eventos, comunidad, tienda y finanzas se dejan preparadas pero se construyen en iteraciones futuras.

---

## 2. Autenticación y Onboarding

- **Login** con email/password vía Supabase Auth
- **Registro** con selección de rol (alumno o mentor)
- **Login con Google** (OAuth)
- **Recuperación de contraseña** con página `/reset-password`
- **Onboarding diferenciado**:
  - Alumno: seleccionar intereses/categorías
  - Mentor: completar perfil profesional (bio, especialidad, redes, precio suscripción)
- Creación automática de perfil en `profiles` al registrarse (trigger en DB)

---

## 3. Explorador de Mentores

- **Grilla de mentores** con filtros por categoría y búsqueda por nombre
- **MentorCard**: foto, nombre, especialidad, precio mensual, botón "Ver perfil"
- **Página de perfil del mentor**: bio completa, cursos disponibles, botón "Suscribirse" (simulado)
- Indicador de mentores destacados (featured)

---

## 4. Formaciones / Cursos

- **Listado de cursos** con filtros por categoría y mentor
- **CourseCard**: imagen, título, mentor, precio, categoría
- **Página de curso**: descripción, programa (módulos y lecciones), instructor, botón de inscripción
- **Reproductor de lecciones**: soporte para video (URL externa), PDFs y texto enriquecido
- **Progreso guardado**: tracking de lecciones completadas por alumno
- Acceso condicional: solo si tiene suscripción al mentor o compró el curso

---

## 5. Dashboard del Alumno

- **Ruta**: `/dashboard`
- Mis cursos activos con progreso
- Mentores a los que está suscripto
- Notificaciones recientes
- Acceso rápido a explorar mentores y cursos

---

## 6. Panel del Mentor

- **Ruta**: `/panel/mentor`
- **Dashboard**: resumen de alumnos activos e ingresos simulados
- **Mis cursos**: crear, editar, publicar/despublicar cursos con módulos y lecciones (formularios completos)
- **Perfil**: editar bio, foto, especialidad, redes sociales
- **Finanzas propias**: vista básica de suscriptores activos e historial (datos simulados por ahora)

---

## 7. Panel de Administración

- **Ruta**: `/panel/admin`
- **Dashboard global**: usuarios totales, mentores activos, cursos publicados
- **Gestión de usuarios**: listar, buscar, cambiar rol, suspender/activar
- **Gestión de mentores**: aprobar, destacar (featured), editar
- **Gestión de cursos**: aprobar/rechazar antes de publicación
- **Configuración**: comisión de plataforma, categorías disponibles

---

## 8. Diseño y UX

- **Tema oscuro premium** con acentos violeta/púrpura (gradientes sutiles)
- **Tipografía**: Inter
- **Mobile-first**, totalmente responsive
- **Sidebar colapsable** en paneles de gestión (mentor, admin)
- **Navbar** con navegación principal y menú de usuario
- **Skeleton loaders** para estados de carga
- **Toasts** para feedback de acciones
- **Todo en español**
- Componentes reutilizables: MentorCard, CourseCard, etc.

---

## 9. Protección de Rutas

- Rutas protegidas por autenticación (redirect a login si no está logueado)
- Rutas protegidas por rol usando `has_role()`:
  - `/dashboard/*` → solo alumno
  - `/panel/mentor/*` → solo mentor
  - `/panel/admin/*` → solo admin
- Componente `ProtectedRoute` que verifica auth + rol

---

## Fuera de este MVP (para iteraciones futuras)

- Eventos online (Whereby) y presenciales (mapas)
- Comunidad / Foros
- Feed de novedades
- Tienda de productos
- Panel de finanzas
- Integración real con MercadoPago y PayPal
- Notificaciones en tiempo real (Supabase Realtime)

