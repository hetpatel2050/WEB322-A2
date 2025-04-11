/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: ______________________ Student ID: ______________ Date: ______________
 ********************************************************************************/

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const clientSessions = require("client-sessions");
const projectData = require("./modules/projects");
const authData = require("./modules/auth-service");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Client Session Configuration
app.use(
  clientSessions({
    cookieName: "session",
    secret: "superSecureRandomKeyChangeThis", // change in production
    duration: 20 * 60 * 1000, // 20 minutes
    activeDuration: 5 * 60 * 1000, // extend session if active
  })
);

// ✅ Make session available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ✅ Helper to protect routes
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static assets
app.use(express.static("public"));

// GET: show form
app.get("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    const sectors = await projectData.getAllSectors();
    res.render("addProject", {
      sectors: sectors,
      page: "/solutions/addProject",
    });
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// POST: submit form
app.post("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    await projectData.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// Initialize projectData AND authData before starting server
projectData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    // Show form to add new project
    app.get("/solutions/projects/add", ensureLogin, async (req, res) => {
      try {
        const sectors = await projectData.getAllSectors();
        res.render("addProject", { sectors });
      } catch (err) {
        res.status(500).send("Unable to load form.");
      }
    });

    // Home Route
    app.get("/", (req, res) => {
      res.render("home", { page: "/" });
    });

    // About Page
    app.get("/about", (req, res) => {
      res.render("about", { page: "/about" });
    });

    // Get all projects or filter by sector
    app.get("/solutions/projects", async (req, res) => {
      try {
        const sector = req.query.sector;
        const projects = sector
          ? await projectData.getProjectsBySector(sector)
          : await projectData.getAllProjects();
        res.render("projects", { projects, page: "/solutions/projects" });
      } catch (error) {
        res.status(404).render("404", { error: error, page: "" });
      }
    });

    // Get project by ID
    app.get("/solutions/projects/:id", async (req, res) => {
      try {
        const project = await projectData.getProjectById(
          parseInt(req.params.id)
        );
        res.render("project", { project, page: "" });
      } catch (error) {
        res.status(404).render("404", { error: error, page: "" });
      }
    });

    // Handle form submission
    app.post("/solutions/projects/add", ensureLogin, async (req, res) => {
      try {
        await projectData.addProject(req.body);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.status(500).send("Failed to add project: " + err);
      }
    });

    // Show edit form
    app.get("/solutions/projects/edit/:id", ensureLogin, async (req, res) => {
      try {
        const [project, sectors] = await Promise.all([
          projectData.getProjectById(req.params.id),
          projectData.getAllSectors(),
        ]);
        res.render("editProject", {
          project,
          sectors,
        });
      } catch (err) {
        res.render("500", {
          message: `Failed to load edit form: ${err}`,
        });
      }
    });

    // Handle edit form submission
    app.post("/solutions/projects/edit/:id", ensureLogin, async (req, res) => {
      try {
        await projectData.updateProject(req.params.id, req.body);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("500", {
          message: `Failed to update project: ${err}`,
        });
      }
    });

    // Delete project
    app.get("/solutions/projects/delete/:id", ensureLogin, async (req, res) => {
      try {
        await projectData.deleteProject(req.params.id);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.render("500", {
          message: `Failed to delete project: ${err}`,
        });
      }
    });

    // Custom 404 Page
    app.use((req, res) => {
      res.status(404).render("404", { error: "Page not found", page: "" });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error initializing project or auth data: ${err}`);
  });

// GET: Show login form
app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: "",
    page: "/login",
  });
});

// GET: Show register form
app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: "",
    page: "/register",
  });
});

// POST: Handle user registration
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
        userName: "",
        page: "/register",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
        page: "/register",
      });
    });
});

// POST: Handle user login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName,
        page: "/login",
      });
    });
});

// GET: Logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// GET: User login history (Protected)
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", {
    page: "/userHistory",
  });
});
