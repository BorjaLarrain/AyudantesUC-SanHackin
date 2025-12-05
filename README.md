## AyudantesUC

Plataforma para compartir reseñas y experiencias sobre ayudantías en la Universidad Católica.

## Instalación

### Requisitos previos

- Node.js (versión 18 o superior)
- npm o yarn

### Pasos para instalar

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd AyudantesUC-SanHackin
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Luego edita el archivo `.env` y completa las siguientes variables con tus credenciales:
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima de tu proyecto Supabase
   - `VITE_GEMINI_API_KEY`: Clave de API de Google Gemini

4. **Ejecutar el proyecto en modo desarrollo**
   ```bash
   npm run dev
   ```

   El proyecto estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye el proyecto para producción
- `npm run preview`: Previsualiza la build de producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Tecnologías utilizadas

- **React 19**: Framework de UI
- **Vite**: Build tool y dev server
- **Supabase**: Backend como servicio (BaaS)
- **Tailwind CSS**: Framework de estilos
- **React Router**: Enrutamiento
- **Google Gemini AI**: Validación de documentos