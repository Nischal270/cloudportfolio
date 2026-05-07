import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import AzureResourcesPage from "./pages/AzureResourcesPage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import EditProjectPage from "./pages/EditProjectPage.jsx";
import MyPortfolioPage from "./pages/MyPortfolioPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";

const API_URL = "http://localhost:5000/projects";
const filterTags = ["All", "React", "Python", "Azure", "Node.js", "ML/AI", "Docker"];

function App() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    githubUrl: "",
    description: "",
    technologies: "",
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Project request failed.");
        }

        const projectData = await response.json();
        setProjects(projectData);
        setError("");
      } catch {
        setError("Unable to load projects. Please make sure json-server is running.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles(files);
  };

  const handleDeleteProject = async (projectId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this project?");

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Project delete failed.");
      }

      setProjects((currentProjects) =>
        currentProjects.filter((project) => String(project.id) !== String(projectId))
      );

      alert("Project deleted successfully. This simulates DELETE /api/projects/{id}.");
    } catch {
      alert("Unable to delete project. Please make sure json-server is running.");
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar LinkComponent={Link} currentUser={currentUser} />

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={
                <BrowsePage
                  projects={projects}
                  isLoading={isLoading}
                  error={error}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedTag={selectedTag}
                  onTagChange={setSelectedTag}
                  filterTags={filterTags}
                  onDeleteProject={handleDeleteProject}
                />
              }
            />
            <Route
              path="/upload"
              element={
                <UploadPage
                  apiUrl={API_URL}
                  formData={formData}
                  attachedFiles={attachedFiles}
                  fileInputKey={fileInputKey}
                  setProjects={setProjects}
                  setFormData={setFormData}
                  setAttachedFiles={setAttachedFiles}
                  setFileInputKey={setFileInputKey}
                  onInputChange={handleInputChange}
                  onFileChange={handleFileChange}
                />
              }
            />
            <Route
              path="/edit/:id"
              element={<EditProjectPage apiUrl={API_URL} setProjects={setProjects} />}
            />
            <Route
              path="/portfolio"
              element={
                <MyPortfolioPage
                  projects={projects}
                  setProjects={setProjects}
                  isLoading={isLoading}
                  error={error}
                  onDeleteProject={handleDeleteProject}
                />
              }
            />
            <Route path="/architecture" element={<AzureResourcesPage />} />
            <Route path="/signin" element={<SignInPage setCurrentUser={setCurrentUser} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
