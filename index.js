export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Intercept the API route
    if (url.pathname === '/get-gallery') {
      try {
        // Read from the vars defined in wrangler.jsonc
        const privateKey = env.IMAGEKIT_PRIVATE_KEY;
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

    // 2. Serve static assets for all other routes (HTML, CSS, app.js)
    return env.ASSETS.fetch(request);
  },
};