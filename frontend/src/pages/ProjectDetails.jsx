import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { isAdmin, isPM, isDev } from "../utils/roleUtils";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", type: "TASK", priority: "MEDIUM", storyPoints: 0, });
  const [activeSprint, setActiveSprint] = useState(null);
  const [view, setView] = useState("BACKLOG"); // BACKLOG or SPRINT
  const [members, setMembers] = useState([]);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: "", startDate: "", endDate: "", });

  useEffect(() => {
    fetchProject();
    fetchSprints();
    fetchIssues();
  }, [id]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const issueId = result.draggableId;
    const newStatus = result.destination.droppableId;

    const issue = issues.find(i => i._id === issueId);

    if (!issue) return;

    const validTransitions = {
      BACKLOG: ["TODO"],
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE"],
      DONE: ["TODO"],
    };

    if (!validTransitions[issue.status]?.includes(newStatus)) {
      return; // block invalid move
    }

    try {
      await api.patch(`/issues/${issueId}/status`, {
        status: newStatus,
      });

      fetchIssues();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComments = async (issueId) => {
    try {
      const res = await api.get(`/comments/${issueId}`);
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (issueId) => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/comments/${issueId}`, {
        message: newComment,
      });

      setNewComment("");
      fetchComments(issueId);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setMembers(res.data.members || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssign = async (issueId, userId) => {
    try {
      await api.patch(`/issues/${issueId}/assign`, {
        userId,
      });

      fetchIssues();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await api.get(`/sprints/project/${id}`);
      setSprints(res.data);

      const active = res.data.find(
        (sprint) => sprint.status === "ACTIVE"
      );

      setActiveSprint(active || null);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await api.get(`/issues/project/${id}`);
      setIssues(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    try {
      await api.post("/issues", {
        ...newIssue,
        project: id,
      });

      setShowModal(false);

      setNewIssue({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        storyPoints: 0,
      });

      fetchIssues();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToSprint = async (issueId) => {
    if (!activeSprint) return;

    try {
      await api.patch(`/issues/${issueId}/add-to-sprint`, {
        sprintId: activeSprint._id,
      });

      fetchIssues();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFromSprint = async (issueId) => {
    try {
      await api.patch(`/issues/${issueId}/remove-from-sprint`);

      fetchIssues();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (issueId) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post(`/issues/${issueId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);
      fetchIssues(); // refresh issue list to get updated attachments
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();

    try {
      await api.post("/sprints", {
        ...newSprint,
        project: id,
      });

      setShowSprintModal(false);

      setNewSprint({
        name: "",
        startDate: "",
        endDate: "",
      });

      fetchSprints();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <h1>{project?.name}</h1>
      {(isAdmin() || isPM()) && (
        <button
          onClick={() => setShowSprintModal(true)}
          style={{
            padding: "6px 12px",
            background: "#0052cc",
            color: "white",
            border: "none",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          + Create Sprint
        </button>
      )}
      <h3>Sprints</h3>
      {sprints.length === 0 ? (
        <p>No sprints found</p>
      ) : (
        <div>
          {sprints.map((sprint) => (
            <div key={sprint._id} style={{ marginBottom: "8px" }}>
              {sprint.name} - {sprint.status}

              {(isAdmin() || isPM()) &&
                sprint.status === "PLANNED" && (
                  <button
                    onClick={async () => {
                      await api.patch(
                        `/sprints/${sprint._id}/start`
                      );
                      fetchSprints();
                    }}
                    style={{
                      marginLeft: "10px",
                      padding: "4px 6px",
                      fontSize: "12px",
                    }}
                  >
                    Start
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {(isAdmin() || isPM()) && (
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 12px",
            background: "#0052cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          + Create Issue
        </button>
      )}

      <h3>Issues</h3>
      <h3>Kanban Board</h3>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setView("BACKLOG")}
          style={{
            marginRight: "10px",
            padding: "6px 12px",
            background: view === "BACKLOG" ? "#0052cc" : "#ccc",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Backlog
        </button>

        <button
          onClick={() => setView("SPRINT")}
          disabled={!activeSprint || isDev()}
          style={{
            padding: "6px 12px",
            background: view === "SPRINT" ? "#0052cc" : "#ccc",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Active Sprint
        </button>
      </div>{view === "SPRINT" && !activeSprint && (
        <p style={{ color: "red" }}>
          No active sprint found for this project.
        </p>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "20px" }}>
          {["BACKLOG", "TODO", "IN_PROGRESS", "DONE"].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: "#eaeaea",
                    padding: "10px",
                    width: "300px",
                    minHeight: "400px",
                    borderRadius: "6px",
                  }}
                >
                  <h4>{status}</h4>

                  {issues
                    .filter((issue) => {
                      // BACKLOG
                      if (view === "BACKLOG") {
                        return !issue.sprint && status === "BACKLOG";
                      }

                      // SPRINT
                      if (view === "SPRINT" && activeSprint) {
                        return (
                          String(issue.sprint?._id || issue.sprint) ===
                          String(activeSprint._id) &&
                          issue.status === status
                        );
                      }

                      return false;
                    })
                    .map((issue, index) => (
                      <Draggable
                        key={issue._id}
                        draggableId={issue._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: "10px",
                              marginBottom: "10px",
                              background: "white",
                              borderRadius: "5px",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div>
                              <div
                                onClick={() => {
                                  setExpandedIssue(issue._id);
                                  fetchComments(issue._id);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <strong>{issue.title}</strong>
                              </div>
                              <p>Priority: {issue.priority}</p>

                              {/* Assigned Info */}
                              <p style={{ fontSize: "12px", color: "#555" }}>
                                Assigned: {issue.assignedTo?.name || "Unassigned"}
                              </p>

                              {/* Assign Dropdown */}
                              {(isAdmin() || isPM()) && (
                                <select
                                  onChange={(e) =>
                                    handleAssign(issue._id, e.target.value)
                                  }
                                  defaultValue=""
                                  style={{
                                    width: "100%",
                                    marginTop: "5px",
                                    padding: "4px",
                                  }}
                                >
                                  <option value="" disabled>
                                    Assign to...
                                  </option>

                                  {members
                                    .filter((member) => member.role === "DEV")
                                    .map((member) => (
                                      <option key={member._id} value={member._id}>
                                        {member.name}
                                      </option>
                                    ))}
                                </select>)}

                              {/* Sprint Controls */}
                              {(isAdmin() || isPM()) && view === "BACKLOG" && activeSprint && (
                                <button
                                  onClick={() => handleAddToSprint(issue._id)}
                                  style={{
                                    marginTop: "5px",
                                    padding: "4px 6px",
                                    fontSize: "12px",
                                    background: "#36b37e",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add to Sprint
                                </button>
                              )}

                              {(isAdmin() || isPM()) && view === "SPRINT" && (
                                <button
                                  onClick={() => handleRemoveFromSprint(issue._id)}
                                  style={{
                                    marginTop: "5px",
                                    padding: "4px 6px",
                                    fontSize: "12px",
                                    background: "#ff5630",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Move to Backlog
                                </button>
                              )}
                            </div>
                            {expandedIssue === issue._id && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "10px",
                                  background: "#f4f6f8",
                                  borderRadius: "6px",
                                }}
                              >
                                <p style={{ fontSize: "13px" }}>
                                  {issue.description}
                                </p>

                                <h5>Comments</h5>

                                {comments.length === 0 ? (
                                  <p style={{ fontSize: "12px" }}>No comments yet</p>
                                ) : (
                                  comments.map((comment) => (
                                    <div
                                      key={comment._id}
                                      style={{
                                        background: "white",
                                        padding: "5px",
                                        marginBottom: "5px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      <strong>{comment.user?.name}</strong>
                                      <p>{comment.message}</p>
                                    </div>
                                  ))
                                )}

                                <div style={{ marginTop: "5px" }}>
                                  <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add comment..."
                                    style={{ width: "80%", padding: "4px" }}
                                  />
                                  <button
                                    onClick={() => handleAddComment(issue._id)}
                                    style={{
                                      padding: "4px 6px",
                                      marginLeft: "5px",
                                      background: "#0052cc",
                                      color: "white",
                                      border: "none",
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                                <h5 style={{ marginTop: "10px" }}>Attachments</h5>

                                {issue.attachments && issue.attachments.length > 0 ? (
                                  issue.attachments.map((file, index) => (
                                    <div key={index} style={{ fontSize: "12px" }}>
                                      <a
                                        href={file.filepath}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "#0052cc" }}
                                      >
                                        {file.filename}
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  <p style={{ fontSize: "12px" }}>No attachments</p>
                                )}

                                <div style={{ marginTop: "5px" }}>
                                  <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                  />

                                  <button
                                    onClick={() => handleFileUpload(issue._id)}
                                    style={{
                                      marginTop: "5px",
                                      padding: "4px 6px",
                                      background: "#36b37e",
                                      color: "white",
                                      border: "none",
                                      fontSize: "12px",
                                    }}
                                  >
                                    Upload
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
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
            onSubmit={handleCreateIssue}
            style={{
              background: "white",
              padding: "20px",
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <h3>Create Issue</h3>

            <input
              type="text"
              placeholder="Title"
              value={newIssue.title}
              onChange={(e) =>
                setNewIssue({ ...newIssue, title: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <textarea
              placeholder="Description"
              value={newIssue.description}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  description: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <select
              value={newIssue.type}
              onChange={(e) =>
                setNewIssue({ ...newIssue, type: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            >
              <option value="TASK">TASK</option>
              <option value="BUG">BUG</option>
              <option value="STORY">STORY</option>
            </select>

            <select
              value={newIssue.priority}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  priority: e.target.value,
                })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <input
              type="number"
              placeholder="Story Points"
              value={newIssue.storyPoints}
              onChange={(e) =>
                setNewIssue({
                  ...newIssue,
                  storyPoints: Number(e.target.value),
                })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="submit">Create</button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showSprintModal && (
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
            onSubmit={handleCreateSprint}
            style={{
              background: "white",
              padding: "20px",
              width: "350px",
              borderRadius: "8px",
            }}
          >
            <h3>Create Sprint</h3>

            <input
              type="text"
              placeholder="Sprint Name"
              value={newSprint.name}
              onChange={(e) =>
                setNewSprint({ ...newSprint, name: e.target.value })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <label>Start Date</label>
            <input
              type="date"
              value={newSprint.startDate}
              onChange={(e) =>
                setNewSprint({
                  ...newSprint,
                  startDate: e.target.value,
                })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <label>End Date</label>
            <input
              type="date"
              value={newSprint.endDate}
              onChange={(e) =>
                setNewSprint({
                  ...newSprint,
                  endDate: e.target.value,
                })
              }
              required
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <div style={{ marginTop: "10px" }}>
              <button type="submit">Create</button>
              <button
                type="button"
                onClick={() => setShowSprintModal(false)}
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

export default ProjectDetails;