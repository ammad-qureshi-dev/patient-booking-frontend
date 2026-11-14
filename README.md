# Appointments

Mobile-first Next.js frontend for the `patient-booking` backend. It follows the Bidder design
system: the same color tokens, Inter, black primary buttons, dot-plus-text status.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

The backend must be running at `API_URL` (default `http://localhost:8080`, set in
`.env.development`). The browser calls `/api/*` and Next proxies it there, so the backend
needs no CORS setup.

## Pages

| Route                     | What it does                                   | Endpoints                                                |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `/`                       | Schedule: today, or a month heat-map calendar  | `GET /v1/appointment/today`, `/from/{d}/to/{d}`          |
| `/appointments/new`       | Book an appointment                            | `POST /v1/appointment`                                   |
| `/appointments/[id]`      | Details and recording a payment                | `GET /v1/appointment`, `PUT /v1/appointment/{id}/payment` |
| `/appointments/[id]/edit` | Edit an appointment                            | `PUT /v1/appointment/{id}`                               |
| `/earnings`               | Totals for today or any month                  | `GET /v1/payment/stats/today`, `/month/{yyyy-MM}`        |

## Deploy to Vercel

1. Push this folder to a GitHub repo and import it at vercel.com/new. Vercel detects Next.js;
   no `vercel.json` or build settings are needed.
2. Under **Project Settings → Environment Variables**, add `API_URL` with your deployed
   backend's HTTPS URL, no trailing slash (e.g. `https://patient-booking.example.com`).
3. Deploy. If `API_URL` is missing, the build fails with a message saying so instead of
   shipping an app that points nowhere. Changing `API_URL` later needs a redeploy.

The backend has to be reachable from the internet; Vercel can't reach `localhost`.
No CORS setup is needed, because the browser only talks to the Vercel app, which proxies
`/api/*` to the backend.

To try a production build locally: `API_URL=http://localhost:8080 npm run build && npm start`.

## Layout

```
app/
  components/ui/   shared primitives (Button, Card, Input, Segmented, …)
  components/      app pieces (AppShell, AppointmentForm, AppointmentRow, PaymentForm)
lib/
  api.ts           every backend call, in one place
  format.ts        date, time, and money helpers (no timezone shifting)
  use-load.ts      tiny fetch-and-track hook used by the pages
```
