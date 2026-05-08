import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProjectPage({ apiUrl, setProjects }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    githubUrl: "",
    description: "",
    technologies: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`${apiUrl}/${id}`);

        if (!response.ok) {
          throw new Error("Project request failed.");
        }

        const projectData = await response.json();
        setProject(projectData);
        setFormData({
          title: projectData.title,
          githubUrl: projectData.githubUrl,
          description: projectData.description,
          technologies: projectData.technologies.join(", "),
        });
        setError("");
      } catch {
        setError("Unable to load project for editing.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [apiUrl, id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage(null);

    if (!formData.title || !formData.githubUrl || !formData.description || !formData.technologies) {
      setFormMessage({ type: "error", text: "Please complete all required fields." });
      return;
    }

    const githubPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

    if (!githubPattern.test(formData.githubUrl)) {
      setFormMessage({
        type: "error",
        text: "Please enter a valid GitHub repository URL, for example: https://github.com/username/repo",
      });
      return;
    }

    const updatedProject = {
      ...project,
      title: formData.title,
      githubUrl: formData.githubUrl,
      description: formData.description,
      technologies: formData.technologies
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error("Project update failed.");
      }

      const savedProject = await response.json();
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          String(currentProject.id) === String(savedProject.id) ? savedProject : currentProject
        )
      );

      navigate("/");
    } catch {
      setFormMessage({ type: "error", text: "Something went wrong. Please try again." });
    }
  };

  if (isLoading) {
    return <p className="empty-message">Loading project...</p>;
  }

  if (error) {
    return <p className="empty-message">{error}</p>;
  }

  return (
    <section className="upload-section">
      <div className="section-heading">
        <h2>Edit Project</h2>
        <p>Update project metadata before returning to Browse.</p>
      </div>

      {formMessage && (
        <p className={`inline-message ${formMessage.type}`}>{formMessage.text}</p>
      )}

      <form className="edit-form form-panel" onSubmit={handleSubmit}>
        <label>
          Project Title *
          <input
            type="text"
            name="title"
            placeholder="e.g. EcoTrack - Environmental Monitoring App"
            value={formData.title}
            onChange={handleInputChange}
          />
        </label>

        <label>
          GitHub Repository URL *
          <input
            type="url"
            name="githubUrl"
            placeholder="https://github.com/username/repo"
            value={formData.githubUrl}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Description *
          <textarea
            name="description"
            placeholder="Brief overview of the project and its purpose..."
            value={formData.description}
            onChange={handleInputChange}
          />
        </label>

        <label>
          Technology Tags *
          <input
            type="text"
            name="technologies"
            placeholder="React, Python, Azure Functions, Cosmos DB"
            value={formData.technologies}
            onChange={handleInputChange}
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Update Project
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditProjectPage;
