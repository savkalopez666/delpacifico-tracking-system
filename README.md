Por protocolos de ciberseguridad
corporativa, los archivos que contienen las credenciales reales de la empresa han sido omitidos del repositorio
público de GitHub

1-. Clonación e Instalación de Dependencias
Desde la terminal del servidor de producción, se debe clonar el proyecto, acceder al directorio del backend e
instalar los módulos requeridos:

delpacifico-tracking-system> cd backend    
npm install

2.- Configuración de Variables de Entorno
Se debe inicializar un archivo con el nombre exacto de .env en la raíz del directorio /backend. El archivo debe
contener los siguientes parámetros estructurales de conexión:

   PORT=3001
WMS_API_URL=[https://api.empresa.cl](https://api.empresa.cl)
WMS_TOKEN=[TOKEN_PROVISTO_POR_EL_CLIENTE]
GOOGLE_SPREADSHEET_ID=1jX_C-V8_fOy9xg1RoWMJisMr-njfzdr6K1tq2H4BbwA

3: Inyección del Archivo de Seguridad Google JSON
Para la lectura directa del documento en la nube,  proveer la llave criptográfica de la cuenta de
servicio de Google Cloud. El equipo técnico debe alojar el archivo original google-credentials.json dentro
de la raíz de la carpeta /backend.

La cuenta de servicio vinculada a estas credenciales es track-order@seguimiento-matriz.iam.gserviceaccount.com y
ya posee permisos de lectura habilitados en la planilla maestra de Google Sheets.

<img width="898" height="274" alt="image" src="https://github.com/user-attachments/assets/bad0a6ce-302f-44d9-af5f-c83bdd9cbfbe" />

Inicialización del Servicio
Para garantizar la alta disponibilidad del backend de la API, se recomienda levantar el servidor mediante 

npm start

Configuración y Compilación del Frontend (React)
La interfaz de usuario requiere establecer la ruta absoluta del servidor API 

LUEGO DE CONFIGURAR y modificar src/api/apiClient.js
Regresar a la raíz general del proyecto e instalar las dependencias visuales y de estado (Lucide React, Tailwind,
Hooks, etc.):
cd ..
npm install

Ejecutar el comando de empaquetado optimizado provisto por Vite:
npm run build

Especificaciones de Mantenimiento

Mantenimiento de datos: No requiere intervención de código. Cualquier inserción, actualización o eliminación
de filas en el documento central de Google Sheets por parte del equipo administrativo se verá reflejada de
forma automática e inmediata en las consultas de los clientes en la web.

Escalabilidad: Si en el futuro se requiere alterar las variables base, basta con editar las claves del
fichero .env sin necesidad de recompilar el entorno de ejecución del servidor.

