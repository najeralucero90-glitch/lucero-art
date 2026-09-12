# Lucero Art — Android sin Android Studio local

El proyecto usa Capacitor para empaquetar la tienda React como aplicación Android. Capacitor permite añadir Android a un proyecto web existente.

## Compilación recomendada para una PC de 2 GB de RAM

No necesitas instalar Android Studio en la computadora local. El repositorio incluye el workflow:

`.github/workflows/build-android.yml`

Ese workflow usa GitHub Actions para crear el proyecto Android y generar `Lucero-Art.apk` en una máquina virtual.

## Antes de compilar

El backend Express debe estar publicado en Internet. La URL pública se introduce al ejecutar manualmente el workflow mediante `backend_url`.

Ejemplo:

```text
https://api.luceroart.com
```

## Resultado

El workflow produce:

```text
release/Lucero-Art.apk
```

y lo publica como artefacto de GitHub Actions llamado `Lucero-Art-APK`.

## Desarrollo local

Si en el futuro usas una computadora con recursos suficientes, también puedes generar Android localmente:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Seguridad

No introduzcas secretos de Stripe, contraseñas o credenciales bancarias en el APK. Las claves secretas deben permanecer en el backend.
