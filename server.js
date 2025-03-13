const express = require('express');
const path = require('path');
const projectData = require('./modules/projects');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets
app.use(express.static('public'));

// Initialize project data before starting server
projectData.initialize().then(() => {
    
    // Home Route
    app.get('/', (req, res) => {
        res.render('home', { page: '/' });
    });

    // About Page
    app.get('/about', (req, res) => {
        res.render('about', { page: '/about' });
    });

    // Get all projects or filter by sector
    app.get('/solutions/projects', async (req, res) => {
        try {
            const sector = req.query.sector;
            const projects = sector ? await projectData.getProjectsBySector(sector) : await projectData.getAllProjects();
            res.render('projects', { projects, page: '/solutions/projects' });
        } catch (error) {
            res.status(404).render('404', { error: error, page: '' });
        }
    });    

    // Get project by ID
    app.get('/solutions/projects/:id', async (req, res) => {
        try {
            const project = await projectData.getProjectById(parseInt(req.params.id));
            res.render('project', { project, page: '' });
        } catch (error) {
            res.status(404).render('404', { error: error, page: '' });
        }
    });

    // Custom 404 Page
    app.use((req, res) => {
        res.status(404).render('404', { error: 'Page not found', page: '' });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log(`Error initializing project data: ${err}`);
});
