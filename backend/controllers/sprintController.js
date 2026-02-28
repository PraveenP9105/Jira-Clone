const Sprint = require("../models/Sprint");
const Project = require("../models/Project");

// Create Sprint
exports.createSprint = async (req, res) => {
  try {
    const { name, project, startDate, endDate } = req.body;

    // Check project exists
    const projectExists = await Project.findById(project);
    if (!projectExists)
      return res.status(404).json({ message: "Project not found" });

    const sprint = await Sprint.create({
      name,
      project,
      startDate,
      endDate,
    });

    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProjectSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find({
      project: req.params.projectId,
    }).sort({ createdAt: -1 });

    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint)
      return res.status(404).json({ message: "Sprint not found" });

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint)
      return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "PLANNED")
      return res.status(400).json({ message: "Sprint already started" });

    // Check if another sprint is active in same project
    const activeSprint = await Sprint.findOne({
      project: sprint.project,
      status: "ACTIVE",
    });

    if (activeSprint)
      return res
        .status(400)
        .json({ message: "Another sprint is already active" });

    sprint.status = "ACTIVE";
    await sprint.save();

    res.json({ message: "Sprint started", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint)
      return res.status(404).json({ message: "Sprint not found" });

    if (sprint.status !== "ACTIVE")
      return res
        .status(400)
        .json({ message: "Only active sprint can be completed" });

    sprint.status = "COMPLETED";
    await sprint.save();

    res.json({ message: "Sprint completed", sprint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);

    if (!sprint)
      return res.status(404).json({ message: "Sprint not found" });

    res.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};