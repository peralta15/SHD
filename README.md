# RetoDiario — PWA

PWA sencilla en español para mostrar un reto diario, marcarlo como completado, suscribirse a notificaciones push y enviar mensajes que disparan notificaciones automáticamente a los dispositivos suscritos. La interfaz no incluye animaciones ni transiciones intencionales.

## Abrir la PWA

1. Abre esta carpeta en VS Code.
2. Instala/activa la extensión **Live Server** si aún no la tienes.
3. Haz clic derecho en `index.html` y selecciona **Open with Live Server**.
4. Mantén el servidor de notificaciones iniciado en otra terminal.

No abras `index.html` directamente como `file://`: los Service Workers y Push necesitan `localhost` o HTTPS.

## Conectar el servidor push

1. Sigue las instrucciones de `reto-diario-servidor/README.md` para generar claves VAPID.
2. Copia la clave pública en `js/app.js`, reemplazando `PEGA_AQUI_TU_CLAVE_PUBLICA_VAPID`.
3. Confirma que `SERVER_URL` sea la dirección del servidor. En local es `http://localhost:3000`.
4. Recarga la PWA y pulsa **Activar notificaciones**.
5. En la tarjeta **Recordatorios**, pulsa **Activar notificaciones** y acepta el permiso. Después escribe un título y mensaje y pulsa **Enviar mensaje y notificar**. El servidor intentará mostrar una notificación en cada dispositivo suscrito y registrará el proceso en su consola.

## Qué guarda

Los retos completados se guardan en el `localStorage` de ese navegador. Las suscripciones push se registran en memoria en el servidor de demostración; si se reinicia, hay que volver a suscribirse.

## Importante

- Configura las claves VAPID tanto en el servidor (`.env`) como la clave pública en `js/app.js`.
- Las notificaciones del sistema pueden no mostrarse si el navegador o el sistema operativo las tiene bloqueadas.
- El servidor debe estar encendido al enviar mensajes. Cada dispositivo debe suscribirse por separado.
