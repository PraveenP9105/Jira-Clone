const Issue = require("../models/Issue");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const cloudinary = require("../config/cloudinary");

// Create Issue
exports.createIssue = async (req, res) => {
  try {
    const { title, description, type, priority, project, storyPoints } =
      req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists)
      return res.status(404).json({ message: "Project not found" });

    const issue = await Issue.create({
      title,
      description,
      type,
      priority,
      project,
      storyPoints,
      createdBy: req.user.id,
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProjectIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      project: req.params.projectId,
    })
      .populate("assignedTo", "name email")
      .populate("sprint")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.assignIssue = async (req, res) => {
  try {
    const { userId } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    issue.assignedTo = userId;
    await issue.save();

    res.json({ message: "Issue assigned", issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    const validTransitions = {
      BACKLOG: ["TODO"],
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE"],
      DONE: ["TODO"],
    };

    if (!validTransitions[issue.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${issue.status} to ${status}`,
      });
    }

    issue.status = status;

    if (status === "DONE") {
      issue.completedAt = new Date();
    }

    await issue.save();

    res.json({ message: "Status updated", issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addIssueToSprint = async (req, res) => {
  try {
    const { sprintId } = req.body;

    const issue = await Issue.findById(req.params.id);
    const sprint = await Sprint.findById(sprintId);

    if (!issue || !sprint)
      return res.status(404).json({ message: "Issue or Sprint not found" });

    issue.sprint = sprintId;
    issue.status = "TODO"; // move from backlog to TODO

    await issue.save();

    res.json({ message: "Issue added to sprint", issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.removeIssueFromSprint = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    issue.sprint = null;
    issue.status = "BACKLOG";

    await issue.save();

    res.json({ message: "Issue moved to backlog", issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.uploadAttachment = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "jira-clone" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    issue.attachments.push({
      filename: result.original_filename,
      filepath: result.secure_url,
    });

    await issue.save();

    res.json({
      message: "File uploaded successfully",
      url: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};