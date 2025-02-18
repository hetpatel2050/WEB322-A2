const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = projectData.map(project => {
                const sector = sectorData.find(s => s.id === project.sector_id);
                return { ...project, sector: sector ? sector.sector_name : "Unknown" };
            });
            resolve();
        } catch (error) {
            reject("Error initializing project data.");
        }
    });
}


function getAllProjects() {
    return new Promise((resolve, reject) => {
        projects.length > 0 ? resolve(projects) : reject("No projects found.");
    });
}


function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === parseInt(projectId));
        project ? resolve(project) : reject(`Project with ID ${projectId} not found.`);
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(p => p.sector.toLowerCase().includes(sector.toLowerCase()));
        filteredProjects.length > 0 ? resolve(filteredProjects) : reject(`No projects found in sector '${sector}'.`);
    });
}


module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
