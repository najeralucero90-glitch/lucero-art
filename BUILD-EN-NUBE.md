# Lucero Art — compilación Android en la nube

Esta versión está preparada para compilar la app Android sin Android Studio en la computadora local.

## Por qué

La computadora del proyecto tiene 2 GB de RAM. El flujo usa GitHub Actions para ejecutar la compilación en una máquina virtual de GitHub y guardar el APK como artefacto descargable.

## Qué hace el flujo

1. Instala Node.js y Java.
2. Instala las dependencias del proyecto.
3. Construye la aplicación React/Vite.
4. Crea el proyecto Android con Capacitor.
5. Sincroniza los archivos web.
6. Genera `Lucero-Art.apk` en modo Debug.
7. Sube el APK a GitHub Actions para descargarlo.

## Cómo usarlo

1. Crea una cuenta en GitHub.
2. Crea un repositorio nuevo, preferiblemente privado.
3. Sube todo el contenido de este ZIP al repositorio.
4. Abre **Actions** y selecciona **Compilar Lucero Art para Android**.
5. Pulsa **Run workflow**.
6. En `backend_url`, escribe la URL pública del backend de Lucero Art, por ejemplo `https://api.tudominio.com`.
7. Cuando termine, abre la ejecución y descarga el artefacto **Lucero-Art-APK**.
8. Dentro del ZIP descargado estará `Lucero-Art.apk`.

## Importante sobre el backend

La app Android no contiene el servidor Express/SQLite. Para que funcionen cuentas, pedidos, catálogo administrable, transferencias y Stripe, el backend debe estar publicado en Internet y la app debe compilarse usando su URL pública.

No pongas claves secretas de Stripe, contraseñas de administrador ni credenciales bancarias en el APK ni en `VITE_*`. Las claves secretas deben quedarse únicamente en el servidor.

## Sobre este APK

El workflow genera un APK Debug para pruebas e instalación directa en Android. Para publicar en Google Play se debe crear un APK/AAB firmado con una clave de firma propia y configurar una compilación de release.
