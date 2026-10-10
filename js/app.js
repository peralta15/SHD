const SERVER_URL = 'https://peralta15-reto-diario-servidor.onrender.com';
// Pega aquí la misma clave pública VAPID que guardaste en server/.env como VAPID_PUBLIC.
const VAPID_PUBLIC_KEY = 'BD9daQWhxTQj0OuW1JP5UjFWDi6ZzgvF71nnk-eLrROl9dAXqY_xITqbl2kd3DIFepyw-ytOTSUCpqaSLGqgZIs';

const challenges = [
  { category: 'BIENESTAR', symbol: '☀', title: 'Dedica 10 minutos a aprender algo nuevo.', description: 'Puede ser una palabra, una habilidad o un tema que siempre te haya dado curiosidad.', time: '10 minutos' },
  { category: 'ORDEN', symbol: '▤', title: 'Organiza un pequeño espacio de tu habitación.', description: 'Elige solo un cajón, tu escritorio o tu mochila. No necesitas ordenar todo.', time: '10 minutos' },
  { category: 'MOVIMIENTO', symbol: '↗', title: 'Tómate un descanso para caminar un poco.', description: 'Levántate, estira el cuerpo y da un pequeño paseo si te es posible.', time: '15 minutos' },
  { category: 'CREATIVIDAD', symbol: '✎', title: 'Escribe tres ideas que te gustaría intentar.', description: 'No importa si son grandes o pequeñas. Solo anótalas para no olvidarlas.', time: '5 minutos' },
  { category: 'CONEXIÓN', symbol: '♡', title: 'Envíale un mensaje bonito a alguien.', description: 'Puede ser un agradecimiento, un saludo o simplemente preguntar cómo está.', time: '5 minutos' },
  { category: 'PAUSA', symbol: '☁', title: 'Regálate cinco minutos sin pantalla.', description: 'Respira con calma, mira por la ventana o disfruta un momento de tranquilidad.', time: '5 minutos' },
  { category: 'APRENDIZAJE', symbol: '✦', title: 'Aprende una palabra nueva.', description: 'Busca su significado e intenta usarla en una oración propia.', time: '5 minutos' },
  { category: 'CUIDADO PERSONAL', symbol: '❀', title: 'Prepara un espacio cómodo para descansar.', description: 'Acomoda tu lugar favorito y date permiso de hacer una pausa.', time: '10 minutos' },
  { category: 'GRATITUD', symbol: '☼', title: 'Anota algo bueno que te haya pasado.', description: 'Puede ser algo sencillo: una canción, una conversación o un momento tranquilo.', time: '3 minutos' },
  { category: 'ENFOQUE', symbol: '◎', title: 'Termina una tarea pequeña que has pospuesto.', description: 'Elige algo que puedas resolver en poco tiempo y concéntrate solo en eso.', time: '10 minutos' }
];

const $ = (id) => document.getElementById(id);
const today = new Date();
const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const dayIndex = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);
const challengeIndex = ((dayIndex % challenges.length) + challenges.length) % challenges.length;
const challenge = challenges[challengeIndex];
const completedKey = 'reto-diario-completados';
const totalKey = 'reto-diario-total';
let completedDates = JSON.parse(localStorage.getItem(completedKey) || '[]');
let totalCompleted = Number(localStorage.getItem(totalKey) || 0);

$('todayLabel').textContent = today.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
$('dayNumber').textContent = `RETO ${String(challengeIndex + 1).padStart(2, '0')}`;
$('challengeSymbol').textContent = challenge.symbol;
$('challengeCategory').textContent = challenge.category;
$('challengeTitle').textContent = challenge.title;
$('challengeDescription').textContent = challenge.description;
$('challengeTime').textContent = challenge.time;

function renderProgress() {
  const doneToday = completedDates.includes(dateKey);
  $('completedCount').textContent = totalCompleted;
  $('progressFill').style.width = doneToday ? '100%' : '0%';
  $('progressTrack').setAttribute('aria-valuenow', doneToday ? '1' : '0');
  $('progressCopy').textContent = doneToday ? '¡Reto de hoy completado! Mañana hay uno nuevo.' : 'Cada pequeño paso cuenta.';
  $('completeButton').disabled = doneToday;
  $('completeButton').innerHTML = doneToday ? 'Reto completado <span aria-hidden="true">✓</span>' : 'Marcar como completado <span aria-hidden="true">✓</span>';
  $('completionNote').textContent = doneToday ? '¡Bien hecho! Gracias por regalarte este momento.' : '';
}

$('completeButton').addEventListener('click', () => {
  if (completedDates.includes(dateKey)) return;
  completedDates.push(dateKey);
  totalCompleted += 1;
  localStorage.setItem(completedKey, JSON.stringify(completedDates));
  localStorage.setItem(totalKey, String(totalCompleted));
  renderProgress();
});
renderProgress();

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

async function updateNotificationButton() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    $('notificationStatus').textContent = 'Este navegador no admite notificaciones push.';
    $('notificationButton').disabled = true;
    return;
  }
  if (Notification.permission === 'denied') {
    $('notificationStatus').textContent = 'Las notificaciones están bloqueadas en el navegador.';
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      $('notificationButton').textContent = 'Notificaciones activadas';
      $('notificationStatus').textContent = 'Este dispositivo ya está suscrito a las notificaciones.';
    }
  } catch (error) {
    $('notificationStatus').textContent = 'Abre la aplicación con Live Server o mediante HTTPS.';
  }
}

$('notificationButton').addEventListener('click', async () => {
  const button = $('notificationButton');
  button.disabled = true;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('No se concedió permiso para las notificaciones.');

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    const response = await fetch(`${SERVER_URL}/api/subscribe`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(subscription)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No se pudo registrar la suscripción en el servidor.');
    
    $('notificationButton').textContent = 'Notificaciones activadas';$('notificationStatus').textContent = '¡Listo! Este dispositivo ya puede recibir notificaciones push.';
  } catch (error) {
    $('notificationStatus').textContent = error.message || 'No se pudieron activar las notificaciones.';
  } finally {
    button.disabled = false;
  }
});


$('sendMessageButton').addEventListener('click', async () => {
  const button = $('sendMessageButton');
  const title = $('messageTitle').value.trim() || 'RetoDiario';
  const body = $('messageBody').value.trim();
  const status = $('messageStatus');
  if (!body) {
    status.textContent = 'Escribe un mensaje antes de enviarlo.';
    $('messageBody').focus();
    return;
  }
  button.disabled = true;
  status.textContent = 'Enviando mensaje al servidor…';
  try {
    const response = await fetch(`${SERVER_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'No se pudo enviar el mensaje.');
    status.textContent = `Proceso terminado: ${result.enviadas} notificación(es) enviada(s), ${result.fallidas} fallida(s).`;
    $('messageBody').value = '';
  } catch (error) {
    status.textContent = `${error.message || 'No se pudo conectar con el servidor.'} Verifica que el servidor esté encendido.`;
  } finally {
    button.disabled = false;
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
updateNotificationButton();
