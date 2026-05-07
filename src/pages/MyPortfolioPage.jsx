import { Link } from "react-router-dom";

const CURRENT_USER = "N. Shrestha";

function MyPortfolioPage({ projects, isLoading, error, onDeleteProject }) {
  const myProjects = projects.filter((project) => project.owner === CURRENT_USER);

  return (
    <section className="hero">
      <section className="section-heading">
        <h2>My Portfolio</h2>
        <p>Projects uploaded by the signed-in student.</p>
        <Link to="/upload" className="submit-project-link">
          Submit New Project
        </Link>
      </section>

      <section className="project-grid">
        {isLoading ? (
          <p className="empty-message">Loading projects...</p>
        ) : error ? (
          <p className="empty-message">{error}</p>
        ) : myProjects.length > 0 ? (
          myProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="card-header">
                <h2>{project.title}</h2>
                <span>Rating {project.rating}</span>
              </div>

              <p className="owner">Owner: {project.owner}</p>
              <p className="description">{project.description}</p>

              <div className="tags">
                {project.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>

              <div className="card-actions">
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <Link to={`/edit/${project.id}`} className="edit-link">
                  Edit
                </Link>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDeleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-message">You have not uploaded any projects yet.</p>
        )}
      </section>
    </section>
  );
}

export default MyPortfolioPage;
