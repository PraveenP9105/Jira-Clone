const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "https://jira-clone-xi-green.vercel.app/",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("JIRA Clone API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const projectRoutes = require("./routes/projectRoutes");
app.use("/api/projects", projectRoutes);

const sprintRoutes = require("./routes/sprintRoutes");
app.use("/api/sprints", sprintRoutes);

const issueRoutes = require("./routes/issueRoutes");
app.use("/api/issues", issueRoutes);

const commentRoutes = require("./routes/commentRoutes");
app.use("/api/comments", commentRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);
