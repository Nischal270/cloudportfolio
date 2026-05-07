const CURRENT_USER = "N. Shrestha";

function DashboardStats({ projects, error }) {
  const uniqueTechnologies = new Set(
    projects.flatMap((project) => project.technologies)
  );
  const myUploads = projects.filter((project) => project.owner === CURRENT_USER);
  const apiStatus = error ? "Offline" : "Online";

  return (
    <section className="dashboard-grid" aria-label="Project summary">
      <article className="dashboard-card">
        <h3>Total Projects</h3>
        <p>{projects.length}</p>
      </article>
      <article className="dashboard-card">
        <h3>Technologies</h3>
        <p>{uniqueTechnologies.size}</p>
      </article>
      <article className="dashboard-card">
        <h3>My Uploads</h3>
        <p>{myUploads.length}</p>
      </article>
      <article className="dashboard-card">
        <h3>API Status</h3>
        <p>{apiStatus}</p>
      </article>
    </section>
  );
}

export default DashboardStats;
