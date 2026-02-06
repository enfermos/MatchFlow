# Documentación - Perfil y Dashboard Empresa

## Perfil de Usuario
Página donde el usuario ve y edita su información personal.

**Archivos**: `profile_user.html`, `js/profile_user.js`

### ¿Qué hace?
- Ver datos personales (nombre, correo, profesión, edad, experiencia)
- Editar información (click "Editar Perfil")
- Cambiar foto (máx 2MB)
- Guardar cambios en el servidor

### Campos importantes:
- **Obligatorios**: nombre, username, correo, profesión
- **Opcionales**: edad, experiencia
- **No editable**: proceso (solo empresa), disponibilidad si está RESERVADO

### Validaciones:
- Correo debe tener @
- Edad debe ser número positivo
- Imagen máximo 2MB

---

## Dashboard Empresa
Panel para empresas con 3 secciones.

**Archivos**: `dashboard-company.html`, `js/dashboard-company.js`

### 1. Candidatos
- Tabla con todos los usuarios registrados
- Ver: nombre, correo, profesión, disponibilidad, proceso
- Botón "Ver perfil" para detalles

### 2. Mis Ofertas
- Tarjetas con ofertas de trabajo
- **Crear**: botón verde → formulario → guardar
- **Editar**: click "Editar" → modificar → guardar
- **Eliminar**: click "Eliminar" → confirmar

### 3. Match
- Tabla de aplicaciones (usuario + oferta)
- Ver: usuario, oferta aplicada, estado, fecha
- Botón "Ver detalle"

---

## Servidor (API)
**URL**: `http://localhost:3005`

### Operaciones:
- **Perfil**: GET `/users?id=1`, PUT `/users/1`
- **Candidatos**: GET `/users`
- **Ofertas**: GET `/offers`, POST `/offers`, PUT `/offers/5`, DELETE `/offers/5`
- **Matches**: GET `/applications`

---

## Pendientes
- Filtrar ofertas por empresa (ahora muestra todas)
- Estados de match reales (ahora siempre dice PENDIENTE)
- Usar modales en lugar de alertas
- Agregar búsqueda y paginación
