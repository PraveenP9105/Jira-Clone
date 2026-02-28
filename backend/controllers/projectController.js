const Project = require("../models/Project");
const User = require("../models/User");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members,
    });

    // Add project to each member's assignedProjects
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { $push: { assignedProjects: project._id } }
      );
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Projects
exports.getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "ADMIN") {
      projects = await Project.find().populate("members", "name email role");
    } else {
      projects = await Project.find({
        members: req.user.id,
      }).populate("members", "name email role");
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};