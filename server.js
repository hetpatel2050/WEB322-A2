const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static assets
app.use(express.static("public"));

// GET: show form
app.get("/solutions/addProject", async (req, res) => {
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
app.post("/solutions/addProject", async (req, res) => {
  try {
    await projectData.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// Initialize project data before starting server
projectData
  .initialize()
  .then(() => {
    // Show form to add new project
    app.get("/solutions/projects/add", async (req, res) => {
      try {
        const sectors = await projectData.getAllSectors();
        res.render("addProject", { sectors }); // assumes addProject.html is renamed to .ejs
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
    app.post("/solutions/projects/add", async (req, res) => {
      try {
        await projectData.addProject(req.body);
        res.redirect("/solutions/projects");
      } catch (err) {
        res.status(500).send("Failed to add project: " + err);
      }
    });

    // Show edit form
    app.get("/solutions/projects/edit/:id", async (req, res) => {
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
    app.post("/solutions/projects/edit/:id", async (req, res) => {
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
    app.get('/solutions/projects/delete/:id', async (req, res) => {
        try {
          await projectData.deleteProject(req.params.id);
          res.redirect('/solutions/projects');
        } catch (err) {
          res.render("500", {
            message: `Failed to delete project: ${err}`
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
    console.log(`Error initializing project data: ${err}`);
  });
