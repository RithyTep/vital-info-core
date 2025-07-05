# HMS System UI (sample)

Project demo: https://lnkd.in/g9EwCxKp

Password: `5569`

Git repository: https://lnkd.in/gQ-89bAs

Tech Stack
- Vite
- React
- shadcn-ui
- Tailwind CSS
- Faker (sample data)

Quick start (local development)

1. Clone the repository:

```sh
git clone https://github.com/RithyTep/vital-info-core
cd vital-info-core
```

2. Install dependencies and run dev server:

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

Docker (optional) — build the production image shown in this repo:

```sh
docker build -t gcr.io/<YOUR_PROJECT_ID>/vital-info-core:latest .
```

Deployment
- This project can be deployed to Vercel, Netlify, or a container platform (GKE).
- If using Netlify, include a `_redirects` file with `/* /index.html 200` to support client-side routing.
- If using a container (GKE), push the built image to a registry (GCR or Docker Hub) and update the Kubernetes manifests in `k8s/`.

Editing and contribution
- Edit files locally and push changes to the repository. Open a PR for review.

License & notes
- This is a sample UI project using fake data for demonstration.
- Use the demo link and password above to explore the interface.
