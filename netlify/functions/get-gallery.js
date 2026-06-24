exports.handler = async () => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const encoded = Buffer.from(privateKey + ':').toString('base64');

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

    // Only return what the frontend needs
    const cleaned = files.map((file) => ({
      url: file.url,
      type: file.fileType === 'non-image' ? 'video' : 'image',
      name: file.name,
      thumbnail: file.fileType === 'non-image' ? file.thumbnail : null,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};