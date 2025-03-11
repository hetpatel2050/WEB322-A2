// server.js
/********************************************************************************
*  WEB322 – Assignment 03 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: [Your Name]    Student ID: [Your ID]    Date: [Submission Date] 
********************************************************************************/

const express = require('express');
const path = require('path');
const projectData = require('./modules/projects');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets
app.use(express.static('public'));

// Initialize project data before starting server
projectData.initialize().then(() => {
    // Home Route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'views/home.html'));
    });
    
    // About Page
    app.get('/about', (req, res) => {
        res.sendFile(path.join(__dirname, 'views/about.html'));
    });

    // Get all projects or filter by sector
    app.get('/solutions/projects', (req, res) => {
        const sector = req.query.sector;
        if (sector) {
            projectData.getProjectsBySector(sector).then(data => {
                res.json(data);
            }).catch(err => {
                res.status(404).json({ error: err });
            });
        } else {
            projectData.getAllProjects().then(data => {
                res.json(data);
            }).catch(err => {
                res.status(404).json({ error: err });
            });
        }
    });

    // Get project by ID
    app.get('/solutions/projects/:id', (req, res) => {
        projectData.getProjectById(parseInt(req.params.id)).then(data => {
            res.json(data);
        }).catch(err => {
            res.status(404).json({ error: err });
        });
    });

    // Custom 404 Page
    app.use((req, res) => {
        res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log(`Error initializing project data: ${err}`);
});
