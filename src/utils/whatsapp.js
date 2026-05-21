export async function sendWhatsApp(message) {
  try {
    await fetch('http://localhost:3000/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: '14794264007@c.us', message }),
    })
  } catch (e) {
    console.warn('WhatsApp unavailable:', e)
  }
}
