# MatchFlow - Plataforma de Contratación Match-First

## 🚀 ¿Qué es MatchFlow?

MatchFlow es una plataforma innovadora que cambia la forma tradicional de contratación:
- **NO** es una plataforma donde los candidatos aplican a ofertas
- **SÍ** es un sistema donde las empresas buscan y crean matches directamente con candidatos

### Diferencias con plataformas tradicionales:
❌ Plataforma tradicional: Candidato → Aplica → Espera  
✅ MatchFlow: Candidato activa "Open to Work" → Empresa lo encuentra → Empresa crea Match

---

## 📋 Funcionalidades Implementadas

### Para Candidatos:
- ✅ **Open to Work**: Toggle que controla si eres visible para empresas
- ✅ **Ver ofertas**: Puedes ver todas las ofertas disponibles (solo lectura)
- ✅ **Ver mis Matches**: Ver empresas que crearon match contigo
- ✅ **Gestión de perfil**: Editar información personal

### Para Empresas:
- ✅ **Ver candidatos disponibles**: Solo ves candidatos con "Open to Work" activo
- ✅ **Crear Matches**: Crear match directo con un candidato para una oferta
- ✅ **Reservar candidatos**: Reservar temporalmente un candidato (bloqueo)
- ✅ **Gestionar estados**: Cambiar estado del match (pending → contacted → interview → hired/discarded)
- ✅ **Privacidad de contacto**: Ver email/teléfono solo cuando el match está en estado "contacted" o superior
- ✅ **CRUD de ofertas**: Crear, editar y eliminar ofertas de trabajo

---

## 🔐 Reglas de Negocio Implementadas

### 1. Open to Work (Visibilidad)
- Los candidatos solo aparecen en búsquedas si tienen `openToWork: true`
- Se controla desde el perfil del candidato con un toggle
- Si está desactivado, la empresa NO puede verlo

### 2. Matches Creados por Empresas
- **Solo las empresas** pueden crear matches
- Los candidatos NO aplican a ofertas
- La empresa selecciona candidato + oferta = match

### 3. Sistema de Reservas
- Una empresa puede "reservar" un candidato para una oferta
- Mientras está reservado, otras empresas no pueden reservarlo
- La empresa puede liberar la reserva cuando quiera
- No impide crear matches, solo reserva temporal

### 4. Estados de Match
Los matches tienen 5 estados posibles:
- `pending`: Recién creado, sin contacto
- `contacted`: Empresa contactó al candidato
- `interview`: En proceso de entrevista
- `hired`: Candidato contratado
- `discarded`: Match descartado

### 5. Privacidad de Datos
- Los datos de contacto (email, teléfono) están **ocultos** inicialmente
- Solo se muestran cuando el match llega a estado `contacted` o superior
- Esto protege la privacidad del candidato

---

## 🛠️ Instalación y Uso

### Paso 1: Instalar dependencias (si no están instaladas)
```bash
npm install
```

### Paso 2: Iniciar el servidor
```bash
npx json-server db.json --port 3005
```

### Paso 3: Abrir la aplicación
- Abrir `index.html` en el navegador
- O usar Live Server en VS Code

### Usuarios de prueba:

**Empresa:**
- Email: `empresa@demo.com`
- Password: `123456`

**Candidatos:**
- Email: `juan@demo.com` - Password: `123456` (openToWork: true)
- Email: `maria@demo.com` - Password: `123456` (openToWork: false)
- Email: `pedro@demo.com` - Password: `123456` (openToWork: true)

---

## 📊 Estructura del Proyecto

```
MatchFlow/
├── index.html                 # Login
├── register.html              # Registro
├── dashboard.html             # Dashboard candidatos
├── dashboard-company.html     # Dashboard empresas
├── profile_user.html          # Perfil de usuario
├── db.json                    # Base de datos (json-server)
├── js/
│   ├── api.js                 # Funciones HTTP y sesión
│   ├── auth.js                # Login/registro
│   ├── dashboard.js           # Dashboard candidatos
│   ├── dashboard-company.js   # Dashboard empresas (matches, reservas)
│   ├── profile_user.js        # Gestión de perfil
│   └── routeProtection.js     # Protección de rutas
└── css/
    └── styles.css             # Estilos
```

---

## 💡 Flujo de Uso Típico

### Como Candidato:
1. Registro y login
2. Ir a "Mi Perfil"
3. Activar toggle "Abierto a Trabajar" 🚀
4. Ver ofertas disponibles (solo lectura)
5. Esperar a que empresas creen matches
6. Ver matches en "Mis Matches"

### Como Empresa:
1. Login con cuenta de empresa
2. Ver sección "Candidatos" (solo ve los que tienen openToWork activo)
3. Opcionalmente "Reservar" un candidato
4. Crear "Match" seleccionando: candidato + mi oferta
5. Ir a "Match" y cambiar estado a "Contactado"
6. Ahora puedes ver email y teléfono del candidato
7. Continuar proceso: interview → hired/discarded

---

## 🎯 Tecnologías Usadas

- HTML5, CSS3, JavaScript ES6
- json-server (backend simulado)
- localStorage (sesiones)
- Fetch API
- Bootstrap 5 (en perfil)

---

## 📝 Notas del Desarrollador

Este proyecto fue desarrollado para aprender:
- Flujos de negocio complejos
- Gestión de estados
- Control de privacidad y visibilidad
- Sistema de match bidireccional
- Manejo de reservas y bloqueos

### Cosas que se podrían mejorar:
- [ ] Usar modales en lugar de `alert()`
- [ ] Agregar paginación en tablas
- [ ] Implementar búsqueda avanzada de candidatos
- [ ] Sistema de notificaciones
- [ ] Chat interno empresa-candidato
- [ ] Dashboard con estadísticas

---

## 🤝 Contribuciones

Este es un proyecto educativo. Si encuentras bugs o mejoras, siéntete libre de sugerir cambios.

---

**¡Gracias por usar MatchFlow!** 🚀
