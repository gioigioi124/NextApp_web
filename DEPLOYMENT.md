# Deployment

## Required environment

- `DATABASE_URL`: PostgreSQL connection string.
- `PORT`: API port, defaults to `8000`.
- `WEB_URL`: public web origin, used by API CORS.
- `API_CORS_ORIGIN`: comma-separated allowed web origins.
- `API_URL`: server-side API URL for the Next.js app.
- `NEXT_PUBLIC_API_URL`: browser API URL for the Next.js app.
- `NEXT_PUBLIC_SITE_URL`: public web URL for metadata, robots, sitemap, and manifest.
- `JWT_SECRET`: required for production auth.

## Build

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
```

## Run API

```bash
pnpm --filter api start:prod
```

Health check:

```bash
curl https://api.example.com/api/v1/health
```

## Run web

```bash
pnpm --filter web start
```

Before going live, set `NEXT_PUBLIC_SITE_URL` to the final domain so
`/robots.txt`, `/sitemap.xml`, and Open Graph URLs are generated correctly.
