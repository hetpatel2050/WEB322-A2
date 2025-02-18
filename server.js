const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  Name: [Your Name] Student ID: [Your Student ID] Date: [Today's Date]
********************************************************************************/

// Serve static files correctly
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// Home Page Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

// About Page Route
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Get all projects or filter by sector
app.get("/solutions/projects", (req, res) => {
    if (req.query.sector) {
        projectData.getProjectsBySector(req.query.sector)
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    } else {
        projectData.getAllProjects()
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    }
});

// Get project by ID dynamically
app.get("/solutions/projects/:id", (req, res) => {
    projectData.getProjectById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
});

// Custom 404 Page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
