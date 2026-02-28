// models/Issue.js

const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    type: {
      type: String,
      enum: ["BUG", "TASK", "STORY"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"],
      default: "BACKLOG",
    },

    storyPoints: {
      type: Number,
      default: 0,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedAt: {
      type: Date,
    },

    attachments: [
      {
        filename: String,
        filepath: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
issueSchema.index({ project: 1 });
issueSchema.index({ sprint: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ status: 1 });

module.exports = mongoose.model("Issue", issueSchema);