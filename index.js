export default {
  async fetch(request, env, ctx) {
    // This allows the worker to read bindings and serve your assets
    return env.ASSETS.fetch(request);
  },
};