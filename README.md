# Libre CO

<p align="center">
  <img src="./img/planetEbook.png" alt="Logo Libre CO" width="140" style="vertical-align:middle; margin-right:12px;"/>
  <span style="font-size:40px; font-weight:800; vertical-align:middle;">
    <span style="color:#F54927">Libre</span>
    <span style="color:#FFFFFF"> CO</span>
  </span>
</p>

API backend para un ecommerce de ebooks. Gestiona autenticación de usuarios, catálogo de libros, compras y acceso al contenido digital.

## Tecnologías

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB"></a>
  <a href="https://mongoosejs.com"><img src="https://img.shields.io/badge/Mongoose-ODM-880000" alt="Mongoose"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://jwt.io"><img src="https://img.shields.io/badge/JWT-Auth-orange?logo=jwt&logoColor=white" alt="JWT"></a>
  <a href="https://joi.dev"><img src="https://img.shields.io/badge/Joi-Validation-5C3A99" alt="Joi"></a>
  <a href="https://www.npmjs.com/package/dotenv"><img src="https://img.shields.io/badge/dotenv-Config-ECB22E" alt="dotenv"></a>
  <a href="https://www.npmjs.com/package/cors"><img src="https://img.shields.io/badge/CORS-Enabled-2E7D32" alt="CORS"></a>
  <a href="https://nodemon.io"><img src="https://img.shields.io/badge/Nodemon-Dev-76D04B?logo=nodemon&logoColor=white" alt="Nodemon"></a>
</p>

## Requisitos
- `Node.js` 18+
- Cuenta y proyecto en `MongoDB Atlas` o instancia local de MongoDB
- Proyecto `Supabase` para autenticación

## Instalación
- Clonar el repositorio y ubicarse en `backend`
- Instalar dependencias: `npm install`

## Configuración
Crear un archivo `.env` en la raíz de `backend` con las variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<tu_secret_seguro>
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

## Ejecución
- Desarrollo: `npm run dev`
- Producción: `npm start`
- Base URL por defecto: `http://localhost:5000`

## Estructura
```
config/              # Conexiones: MongoDB y Supabase
controllers/         # Lógica de negocio (auth, usuarios, libros, compras)
middleware/          # Autenticación, validaciones y permisos
models/              # Modelos Mongoose (User, Book, Purchase)
routes/              # Rutas Express
utils/               # Utilidades
img/                 # Activos de imagen (logo)
server.js            # Bootstrap del servidor
```

## Endpoints principales

### Auth (`/api/auth`)
- `POST /register` Registro con Supabase + persistencia en MongoDB
- `POST /login` Login vía Supabase y emisión de `JWT`
- `GET /profile` Requiere `Authorization: Bearer <token>`
- `POST /logout` Cierre de sesión en Supabase

### Usuarios (`/api/users`)
- `GET /` Listado de usuarios (requiere autenticación)
- `PUT /profile` Actualiza perfil del usuario autenticado

### Libros (`/api/books`)
- `GET /` Lista libros. Query: `categoria`, `promocional`, `page`, `limit`
- `GET /promocionales` Lista de libros en promoción
- `GET /categoria/:categoria` Filtra por categoría
- `GET /:id` Obtiene libro por ID (sin `ebook`)
- `GET /:id/detalles` Incluye `ebook` si el usuario lo compró (requiere token)

### Compras
- Vía libros: `POST /api/books/comprar` crea compra
- Vía libros: `GET /api/books/compras/mis-compras` compras del usuario
- Vía libros: `GET /api/books/:libroId/verificar-compra` verifica compra
- Rutas dedicadas: `POST /api/purchases/`, `GET /api/purchases/`, `GET /api/purchases/check/:libroId`

### Healthcheck
- `GET /api/health` Estado del servicio y conexión a DB

## Payloads y validaciones de compra
- Campo `metodoPago`: `tarjeta` | `paypal` | `transferencia`
- Para `tarjeta` (`cardData`): `numero`, `expiracion` (MM/AA), `cvv`, `nombre`
- Para `paypal` (`paypalData`): `email`
- Para `transferencia` (`transferenciaData`): `referencia`

Validaciones internas:
- Algoritmo de Luhn para tarjetas, formato y CVV
- Email válido para PayPal
- Referencia mínima para transferencia

## Notas de seguridad
- Usa `JWT` para proteger rutas. Envía el token en `Authorization: Bearer <token>`
- No expongas claves de `Supabase` ni `JWT_SECRET` en clientes
- Indiza modelos para rendimiento y evita compras duplicadas

## Scripts
- `npm run dev` Inicia servidor con `nodemon`
- `npm start` Inicia servidor con `node`
