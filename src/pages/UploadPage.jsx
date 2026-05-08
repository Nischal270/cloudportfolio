function UploadPage({
  apiUrl,
  formData,
  attachedFiles,
  fileInputKey,
  setProjects,
  setFormData,
  setAttachedFiles,
  setFileInputKey,
  onInputChange,
  onFileChange,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title || !formData.githubUrl || !formData.description || !formData.technologies) {
      alert("Please complete all required fields.");
      return;
    }

    const githubPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

    if (!githubPattern.test(formData.githubUrl)) {
      alert("Please enter a valid GitHub repository URL, for example: https://github.com/username/repo");
      return;
    }

    const newProject = {
      title: formData.title,
      owner: "N. Shrestha",
      technologies: formData.technologies
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      rating: 0,
      description: formData.description,
      githubUrl: formData.githubUrl,
      files: [],
    };

    try {
      let requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      };

      if (attachedFiles.length > 0) {
        const uploadData = new FormData();

        uploadData.append("title", formData.title);
        uploadData.append("githubUrl", formData.githubUrl);
        uploadData.append("description", formData.description);
        uploadData.append("technologies", formData.technologies);
        uploadData.append("owner", "N. Shrestha");
        attachedFiles.forEach((file) => uploadData.append("files", file));

        requestOptions = {
          method: "POST",
          body: uploadData,
        };
      }

      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        throw new Error("Project save failed.");
      }

      const savedProject = await response.json();
      setProjects((currentProjects) => [savedProject, ...currentProjects]);
      setFormData({
        title: "",
        githubUrl: "",
        description: "",
        technologies: "",
      });
      setAttachedFiles([]);
      setFileInputKey((currentKey) => currentKey + 1);

      alert("Project added successfully. This simulates POST /api/projects.");
    } catch {
      alert("Unable to save project. Please check that json-server is running.");
    }
  };

  return (
    <section className="upload-section">
      <div className="section-heading">
        <h2>Submit New Project</h2>
        <p>
          This form simulates creating a project record in Cosmos DB and
          attaching media files for Blob Storage.
        </p>
      </div>

      <form className="upload-layout" onSubmit={handleSubmit}>
        <div className="form-panel">
          <label>
            Project Title *
            <input
              type="text"
              name="title"
              placeholder="e.g. EcoTrack - Environmental Monitoring App"
              value={formData.title}
              onChange={onInputChange}
            />
          </label>

          <label>
            GitHub Repository URL *
            <input
              type="url"
              name="githubUrl"
              placeholder="https://github.com/username/repo"
              value={formData.githubUrl}
              onChange={onInputChange}
            />
          </label>

          <label>
            Description *
            <textarea
              name="description"
              placeholder="Brief overview of the project and its purpose..."
              value={formData.description}
              onChange={onInputChange}
            />
          </label>

          <label>
            Technology Tags *
            <input
              type="text"
              name="technologies"
              placeholder="React, Python, Azure Functions, Cosmos DB"
              value={formData.technologies}
              onChange={onInputChange}
            />
          </label>

          <button type="submit" className="submit-button">
            Submit Project
          </button>
        </div>

        <div className="media-panel">
          <h3>Media Upload</h3>

          <label className="drop-zone">
            <input
              key={fileInputKey}
              type="file"
              multiple
              onChange={onFileChange}
            />
            <span>Choose files to attach or drag them here.</span>
          </label>

          {attachedFiles.length > 0 && (
            <div className="file-list">
              <h4>Selected files</h4>
              <ul>
                {attachedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}

export default UploadPage;
