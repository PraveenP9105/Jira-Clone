const Comment = require("../models/Comment");
const Issue = require("../models/Issue");

exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;

    const issue = await Issue.findById(req.params.issueId);

    if (!issue)
      return res.status(404).json({ message: "Issue not found" });

    const comment = await Comment.create({
      issue: issue._id,
      user: req.user.id,
      message,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getIssueComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      issue: req.params.issueId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};