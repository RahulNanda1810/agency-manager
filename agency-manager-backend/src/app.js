const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const orgRoutes = require("./routes/org.routes");
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const sprintRoutes = require("./routes/sprint.routes");
const myTasksRoutes = require("./routes/my-tasks.routes");


const commentRoutes = require("./routes/comment.routes");
const attachmentRoutes = require("./routes/attachment.routes");
const reportRoutes = require("./routes/report.routes");
const dailySummaryRoutes = require("./routes/daily-summary.routes");

const app = express();

// Configure CORS to allow frontend domains
app.use(cors({
  origin: ['http://localhost:4200', 'https://agency-managern.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/orgs", orgRoutes);
app.use("/clients", clientRoutes);
app.use("/projects", projectRoutes);
app.use("/api/projects/:projectId/sprints", sprintRoutes);
app.use("/tasks", myTasksRoutes);
app.use("/tasks", taskRoutes);
app.use("/comments", commentRoutes);
app.use("/attachments", attachmentRoutes);
app.use("/orgs", reportRoutes);
app.use("/orgs", dailySummaryRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);








