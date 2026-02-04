### Paso a paso

- Abrir la terminal
- poner el siguiente comando "npx json-server db.json --port 3005"
- ya con esto el server esta on

#### URL

- API_BASE = "http://localhost:3005";

#### USERS

los usuarios de prueba para hacer el proceso de login
{
"id": "1",
"name": "Admin",
"email": "admin@demo.com",
"password": "123456",
"role": "admin"
},
{
"id": "2",
"name": "User",
"email": "user@demo.com",
"password": "123456",
"role": "user"
}

### Contexto del producto:

Plataforma de contratación de Crudzaso que agiliza el reclutamiento: los candidatos activan su disponibilidad y las empresas los buscan y reservan directamente para ofertas específicas, reduciendo el tiempo de contratación.

### Objetivo del proyecto:

El proyecto busca desarrollar una aplicación web que permita:
A los candidatos crear y gestionar su perfil profesional, definir su disponibilidad y explorar ofertas de empleo.
A las empresas gestionar su perfil, publicar ofertas, buscar candidatos disponibles, crear coincidencias y gestionar reservas de candidatos.

### Roles del sistema:

Candidato: Gestiona su perfil, activa su estado de "Abierto a trabajar", consulta ofertas y espera a ser contactado.
Empresa: Gestiona su perfil de empresa, publica ofertas, busca candidatos, crea coincidencias directas, reserva candidatos y gestiona los estados del proceso de contratación.

### Reglas empresariales clave:

Abierto a trabajar: Un candidato solo es visible para las empresas si activa esta opción.
Coincidencia: Las coincidencias se crean exclusivamente por las empresas y siempre deben estar asociadas a una empresa, una oferta de trabajo y un candidato.
Reserva y bloqueo: Una empresa puede reservar un candidato, bloqueándolo temporalmente para otras empresas hasta que se termine el proceso de contratación.
Privacidad: Las empresas solo pueden ver los datos de contacto del candidato una vez que este sea contactado.

### Requisitos técnicos:

- Uso de json-server como backend simulado.
- Consumo de datos mediante fetch.
- Implementación de almacenamiento en caché (por ejemplo, con localStorage).
- Gestión adecuada de reservas y bloqueos.

### Organización del equipo y flujo de trabajo:

- Equipos de hasta 5 miembros, con al menos 2 miembros de cada rol (desarrolladores y líderes).
- Uso de GitHub para control de versiones con un flujo de trabajo basado en Git Flow.
- Herramientas opcionales de gestión de proyectos como Trello o Jira.
- Documentación obligatoria en el repositorio, incluyendo la descripción del producto, las reglas de negocio y las instrucciones de ejecución.

### Criterios mínimos de aceptación:

- Activación del estado "Abierto a trabajar" para que los candidatos sean visibles.
- Capacidad de las empresas para crear ofertas de empleo, buscar candidatos y gestionar coincidencias.
- Implementación de reservas de candidatos con bloqueo temporal.
- Habilitación del contacto solo cuando la coincidencia llega a ser "contactada".
- Uso de json-server y almacenamiento en caché.
- Adecuada documentación y versionado del proyecto.
- Este resumen describe los elementos esenciales del proyecto, el flujo de trabajo y los requisitos técnicos para el desarrollo de MatchFlow.
