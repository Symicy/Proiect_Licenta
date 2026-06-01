# WattWise Web App

Next.js dashboard for the LoRaWAN smart utility monitoring thesis project.

## Local Development

Start the Docker infrastructure from the repository root:

```powershell
docker compose up -d
```

Then start the web app and MQTT worker together from this directory:

```powershell
npm run dev:all
```

This runs:

- `npm run dev:web`: starts the Next.js app on `http://localhost:3000`
- `npm run worker`: starts `mqtt-worker/index.ts` and subscribes to ChirpStack MQTT uplinks

You can still run them separately when debugging:

```powershell
npm run dev:web
npm run worker
```

## Checks

```powershell
npm run lint
npx tsc --noEmit
npm run build
```
