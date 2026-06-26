export async function onRequestPost(context) {
  const { request, env } = context;

  const formData = await request.formData();
  const name = formData.get('name');
  const phone = formData.get('phone');
  const guests = formData.get('guests');
  const message = formData.get('message') || 'None';
  const botField = formData.get('bot-field');

  // Honeypot
  if (botField) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Moonbeam Reservations',
      to: 'kennethmadondo@gmail.com',
      subject: `New Reservation — ${name} (${guests} guest(s))`,
      html: `
        <h2>New Moonbeam Reservation</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Guests:</strong> ${guests}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    })
  });

  if (res.ok) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    const error = await res.text();
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }
}