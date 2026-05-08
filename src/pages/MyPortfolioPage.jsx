import { useState } from "react";
import { Link } from "react-router-dom";

const CURRENT_USER = "N. Shrestha";

function MyPortfolioPage({ projects, isLoading, error, onDeleteProject, onDownloadProject }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const myProjects = projects.filter((project) => project.owner === CURRENT_USER);

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmDelete = async (projectId) => {
    const result = await onDeleteProject(projectId);

    setPendingDeleteId(null);
    showFeedback(result.message, result.ok ? "success" : "error");
  };

  const handleDownload = async (project) => {
    const result = await onDownloadProject(project);

    if (!result.ok) {
      showFeedback(result.message, "error");
    }
  };

  return (
    <section className="hero">
      <section className="section-heading">
        <h2>My Portfolio</h2>
        <p>Projects uploaded by the signed-in student.</p>
        <Link to="/upload" className="submit-project-link">
          Submit New Project
        </Link>
      </section>

      {feedback && (
        <p className={`inline-message ${feedback.type}`}>{feedback.message}</p>
      )}

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
                  onClick={() => setPendingDeleteId(project.id)}
                >
                  Delete
                </button>
                <button type="button" onClick={() => handleDownload(project)}>
                  Download
                </button>
              </div>

              {pendingDeleteId === project.id && (
                <div className="card-confirm">
                  <p>Confirm delete?</p>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleConfirmDelete(project.id)}
                  >
                    Yes, Delete
                  </button>
                  <button type="button" onClick={() => setPendingDeleteId(null)}>
                    Cancel
                  </button>
                </div>
              )}
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
