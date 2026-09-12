# Lucero Art — Tienda online completa

Esta versión pasa de prototipo a una arquitectura full-stack:

## Incluye
- Tienda React/Vite con el diseño de Lucero Art.
- API Express.
- Base de datos SQLite.
- Registro e inicio de sesión de clientes.
- Sesiones con JWT.
- Catálogo administrable.
- Panel de administración protegido.
- Alta/baja de productos.
- Gestión de pedidos y estados.
- Encargos personalizados.
- Carrito.
- Checkout con Stripe cuando se configura `STRIPE_SECRET_KEY`.
- Pedido alternativo por WhatsApp.
- PWA.

## Instalación local

1. Instala Node.js 18+.
2. Descomprime el proyecto.
3. Copia `.env.example` como `.env`.
4. Cambia `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `VITE_WHATSAPP`.
5. Ejecuta:

```bash
npm install
npm run dev
```

Web: http://localhost:5173
API: http://localhost:3001

## Publicación

Para producción:

```bash
npm run build
NODE_ENV=production npm start
```

En un servidor con almacenamiento persistente, SQLite conserva los datos.

## Pagos

Stripe está preparado, pero por seguridad no incluye ninguna clave real. Agrega tu `STRIPE_SECRET_KEY` en `.env`. Si no está configurada, la tienda ofrece WhatsApp como alternativa.

## WhatsApp

Cambia `VITE_WHATSAPP` por el número de WhatsApp Business de Lucero Art.

## Importante

Para una tienda pública se recomienda:
- HTTPS.
- Un secreto JWT fuerte.
- Contraseña de administración fuerte.
- Backups de la base de datos.
- Almacenamiento externo para imágenes.
- Configurar webhooks de Stripe para confirmar pagos en servidor antes de marcar un pedido como pagado.
- Política de privacidad, términos, devoluciones y aviso de envíos.
- Configurar dominio y correo comercial.

La aplicación queda lista como base funcional, pero las cuentas de terceros (hosting, dominio, Stripe y WhatsApp Business) tienen que ser de Lucero Art.
