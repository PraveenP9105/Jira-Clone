const Issue = require("../models/Issue");
const Sprint = require("../models/Sprint");

// Sprint Burndown
exports.getSprintBurndown = async (req, res) => {
  try {
    const sprintId = req.params.sprintId;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint)
      return res.status(404).json({ message: "Sprint not found" });

    const issues = await Issue.find({
      sprint: sprintId,
    });

    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Total story points
    const totalStoryPoints = issues.reduce(
      (sum, issue) => sum + (issue.storyPoints || 0),
      0
    );

    const dailyData = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      // Remaining story points on this day
      const remaining = issues
        .filter((issue) => {
          if (!issue.completedAt) return true;
          return new Date(issue.completedAt) > currentDate;
        })
        .reduce(
          (sum, issue) => sum + (issue.storyPoints || 0),
          0
        );

      dailyData.push({
        date: currentDate.toISOString().split("T")[0],
        remaining,
      });
    }

    // Ideal burn line
    const idealBurn = dailyData.map((_, index) => {
      return (
        totalStoryPoints -
        (totalStoryPoints / (totalDays - 1)) * index
      );
    });

    res.json({
      totalStoryPoints,
      dailyData,
      idealBurn,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Velocity Report
exports.getProjectVelocity = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const sprints = await Sprint.find({
      project: projectId,
      status: "COMPLETED",
    });

    const velocityData = [];

    for (let sprint of sprints) {
      const completedIssues = await Issue.find({
        sprint: sprint._id,
        status: "DONE",
      });

      const totalStoryPoints = completedIssues.reduce(
        (sum, issue) => sum + (issue.storyPoints || 0),
        0
      );

      velocityData.push({
        sprint: sprint.name,
        storyPointsCompleted: totalStoryPoints,
      });
    }

    res.json(velocityData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require("../models/User");

// Developer Productivity
exports.getDeveloperProductivity = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const issues = await Issue.find({
      project: projectId,
      status: "DONE",
    }).populate("assignedTo", "name");

    const productivityMap = {};

    issues.forEach((issue) => {
      if (!issue.assignedTo) return;

      const devName = issue.assignedTo.name;

      if (!productivityMap[devName]) {
        productivityMap[devName] = {
          issuesCompleted: 0,
          storyPoints: 0,
        };
      }

      productivityMap[devName].issuesCompleted += 1;
      productivityMap[devName].storyPoints +=
        issue.storyPoints || 0;
    });

    res.json(productivityMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};