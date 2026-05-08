import { Link } from "react-router-dom";
import DashboardStats from "../components/DashboardStats.jsx";

function BrowsePage({
  projects,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  selectedTag,
  onTagChange,
  filterTags,
  onDeleteProject,
  onDownloadProject,
}) {
  const filteredProjects = projects.filter((project) => {
    const searchMatch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.join(" ").toLowerCase().includes(searchTerm.toLowerCase());

    const tagMatch =
      selectedTag === "All" ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(selectedTag.toLowerCase())
      );

    return searchMatch && tagMatch;
  });

  return (
    <section className="hero">
      <section className="intro">
        <h1>Discover Student Cloud Projects</h1>
        <p>
          Browse, search, and showcase academic software projects using a
          cloud-native portfolio platform.
        </p>
      </section>

      <DashboardStats projects={projects} error={error} />

      <section className="search-panel">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by project name, technology, or keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="button">Search</button>
        </div>

        <div className="filters">
          {filterTags.map((tag) => (
            <button
              key={tag}
              className={selectedTag === tag ? "active" : ""}
              type="button"
              onClick={() => onTagChange(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="project-grid">
        {isLoading ? (
          <p className="empty-message">Loading projects...</p>
        ) : error ? (
          <p className="empty-message">{error}</p>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
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
                <button type="button" onClick={() => onDownloadProject(project)}>
                  Download
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-message">No projects found.</p>
        )}
      </section>
    </section>
  );
}

export default BrowsePage;
