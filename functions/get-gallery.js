export async function onRequestGet(context) {
  try {
    const privateKey = context.env.IMAGEKIT_PRIVATE_KEY;
    const encoded = btoa(privateKey + ':');

    const response = await fetch(
      'https://api.imagekit.io/v1/files?limit=100&sort=DESC_CREATED',
      {
        headers: {
          Authorization: `Basic ${encoded}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ImageKit error: ${response.status}`);
    }

    const files = await response.json();

    const cleaned = files.map((file) => ({
      url: file.url,
      type: file.fileType === 'non-image' ? 'video' : 'image',
      name: file.name,
      thumbnail: file.fileType === 'non-image' ? file.thumbnail : null,
    }));

    return new Response(JSON.stringify(cleaned), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}