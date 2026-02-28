import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/roleUtils";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", description: "", members: [], });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setAllUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      await api.post("/projects", newProject);

      setShowModal(false);
      setNewProject({
        name: "",
        description: "",
        members: [],
      });

      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <h1>Dashboard</h1>

      {isAdmin() && (
        <button
          onClick={() => {
            setShowModal(true);
            fetchUsers();
          }}
          style={{
            padding: "8px 12px",
            background: "#0052cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginBottom: "15px",
            cursor: "pointer",
          }}
        >
          + Create Project
        </button>
      )}

      <h3>Your Projects</h3>

      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              style={{
                cursor: "pointer",
                padding: "8px",
                background: "white",
                marginBottom: "8px",
                borderRadius: "6px",
              }}
            >
              {project.name}
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleCreateProject}
            style={{
              background: "white",
              padding: "20px",
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <h3>Create Project</h3>

            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <textarea
              placeholder="Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  description: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <h4>Select Members</h4>

            {allUsers.map((user) => (
              <div key={user._id}>
                <label>
                  <input
                    type="checkbox"
                    value={user._id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewProject({
                          ...newProject,
                          members: [...newProject.members, user._id],
                        });
                      } else {
                        setNewProject({
                          ...newProject,
                          members: newProject.members.filter(
                            (id) => id !== user._id
                          ),
                        });
                      }
                    }}
                  />
                  {user.name} ({user.role})
                </label>
              </div>
            ))}

            <div style={{ marginTop: "10px" }}>
              <button type="submit">Create</button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );

}

export default Dashboard;