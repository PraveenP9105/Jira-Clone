import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";

import { Line, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSprint, setSelectedSprint] = useState("");

  const [burndown, setBurndown] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [productivity, setProductivity] = useState({});

  // Fetch projects on load
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

  const fetchSprints = async (projectId) => {
    try {
      const res = await api.get(`/sprints/project/${projectId}`);
      setSprints(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBurndown = async (sprintId) => {
    try {
      const res = await api.get(`/reports/burndown/${sprintId}`);
      setBurndown(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVelocity = async (projectId) => {
    try {
      const res = await api.get(`/reports/velocity/${projectId}`);
      setVelocity(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProductivity = async (projectId) => {
    try {
      const res = await api.get(`/reports/productivity/${projectId}`);
      setProductivity(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    setSelectedSprint("");
    setBurndown(null);

    fetchSprints(projectId);
    fetchVelocity(projectId);
    fetchProductivity(projectId);
  };

  const handleSprintChange = (sprintId) => {
    setSelectedSprint(sprintId);
    fetchBurndown(sprintId);
  };

  return (
    <Layout>
      <h1>Reports Dashboard</h1>

      {/* Project Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Project: </label>
        <select
          value={selectedProject}
          onChange={(e) =>
            handleProjectChange(e.target.value)
          }
        >
          <option value="">-- Select Project --</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sprint Dropdown */}
      {selectedProject && (
        <div style={{ marginBottom: "20px" }}>
          <label>Select Sprint: </label>
          <select
            value={selectedSprint}
            onChange={(e) =>
              handleSprintChange(e.target.value)
            }
          >
            <option value="">-- Select Sprint --</option>
            {sprints.map((sprint) => (
              <option key={sprint._id} value={sprint._id}>
                {sprint.name} ({sprint.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Burndown */}
      {burndown && (
        <>
          <h3>Sprint Burndown</h3>
          <Line
            data={{
              labels: burndown.dailyData.map(
                (d) => d.date
              ),
              datasets: [
                {
                  label: "Actual Remaining",
                  data: burndown.dailyData.map(
                    (d) => d.remaining
                  ),
                },
                {
                  label: "Ideal Burn",
                  data: burndown.idealBurn,
                },
              ],
            }}
          />
        </>
      )}

      {/* Velocity */}
      {velocity.length > 0 && (
        <>
          <h3>Velocity</h3>
          <Bar
            data={{
              labels: velocity.map((v) => v.sprint),
              datasets: [
                {
                  label: "Story Points Completed",
                  data: velocity.map(
                    (v) => v.storyPointsCompleted
                  ),
                },
              ],
            }}
          />
        </>
      )}

      {/* Productivity */}
      {Object.keys(productivity).length > 0 && (
        <>
          <h3>Developer Productivity</h3>
          <Bar
            data={{
              labels: Object.keys(productivity),
              datasets: [
                {
                  label: "Story Points",
                  data: Object.values(productivity).map(
                    (dev) => dev.storyPoints
                  ),
                },
              ],
            }}
          />
        </>
      )}
    </Layout>
  );
}

export default Reports;