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
const allowedOrigins = [
  'http://localhost:4200',
  'https://agency-managern.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
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








