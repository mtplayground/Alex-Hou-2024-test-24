# Alex-Hou-2024-test-24

## Docker

The app can be built and served as a static SPA with a multi-stage Docker
image. The build stage uses Node + pnpm, and the runtime stage serves the
compiled assets from `nginx:alpine` with SPA fallback routing enabled.

1. Copy the example environment file:
   `cp .env.example .env`
2. Build the image:
   `docker build -t pulley-playground --build-arg VITE_APP_TITLE="Pulley Playground" --build-arg VITE_BASE_PATH="/" --build-arg VITE_ENABLE_SOUND=true .`
3. Run the container on port `8080`:
   `docker run --rm -p 8080:8080 pulley-playground`

The included `nginx.conf` rewrites unknown paths back to `index.html`, so
client-side routes such as `/lessons/example` and `/gallery` load correctly.
