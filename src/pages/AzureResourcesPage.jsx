const azureServices = [
  {
    name: "Azure Static Web Apps",
    localEquivalent: "Vite React frontend",
    purpose: "Hosts the single-page application with HTTPS and global CDN.",
  },
  {
    name: "Azure Functions",
    localEquivalent: "json-server REST API simulation",
    purpose: "Provides HTTP-triggered CRUD endpoints.",
  },
  {
    name: "Azure Cosmos DB",
    localEquivalent: "db.json project records",
    purpose:
      "Stores project metadata such as title, description, tags, GitHub URL, owner, and rating.",
  },
  {
    name: "Azure Blob Storage",
    localEquivalent: "selected file names in the upload form",
    purpose: "Stores uploaded multimedia files such as screenshots and videos.",
  },
  {
    name: "Microsoft Entra ID",
    localEquivalent: "simulated sign-in state",
    purpose: "Authenticates students and provides user identity claims.",
  },
  {
    name: "Application Insights",
    localEquivalent: "frontend dashboard/API status",
    purpose: "Monitors API availability, usage, errors, and performance.",
  },
  {
    name: "GitHub Actions CI/CD",
    localEquivalent: "local npm run dev and npm run build workflow",
    purpose: "Automates build and deployment to Azure Static Web Apps.",
  },
];

const flowSteps = [
  "Browser SPA",
  "Azure Static Web Apps",
  "Azure Functions REST API",
  "Cosmos DB + Blob Storage",
  "Application Insights Monitoring",
];

function AzureResourcesPage() {
  return (
    <section className="hero">
      <section className="intro">
        <h1>Azure Architecture</h1>
        <p>
          How the local CloudPortfolio prototype maps to a cloud-native Azure
          deployment.
        </p>
      </section>

      <section className="architecture-grid" aria-label="Azure service mapping">
        {azureServices.map((service) => (
          <article className="architecture-card" key={service.name}>
            <span className="service-label">{service.name}</span>
            <p className="local-label">Local equivalent: {service.localEquivalent}</p>
            <p>{service.purpose}</p>
          </article>
        ))}
      </section>

      <section className="architecture-flow" aria-label="Architecture flow">
        {flowSteps.map((step, index) => (
          <div className="flow-step" key={step}>
            <span>{step}</span>
            {index < flowSteps.length - 1 && <strong>{"\u2193"}</strong>}
          </div>
        ))}
      </section>

      <p className="prototype-note">
        This page is a prototype explanation page. In the deployed version, json-server will be replaced by Azure Functions and Cosmos DB.
      </p>
    </section>
  );
}

export default AzureResourcesPage;
