const fs = require('fs');
const path = require('path');

const projectDataPath = path.join(__dirname, '../data/projectData.json');
const sectorDataPath = path.join(__dirname, '../data/sectorData.json');

let projects = [];

async function initialize() {
    return new Promise((resolve, reject) => {
        try {
            const projectData = JSON.parse(fs.readFileSync(projectDataPath, 'utf8'));
            const sectorData = JSON.parse(fs.readFileSync(sectorDataPath, 'utf8'));
            projects = projectData.map(project => {
                const sector = sectorData.find(s => s.id === project.sector_id);
                return { ...project, sector: sector ? sector.sector_name : 'Unknown' };
            });
            resolve();
        } catch (error) {
            reject("Unable to load project data.");
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) resolve(projects);
        else reject("No projects available.");
    });
}

function getProjectById(id) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === id);
        project ? resolve(project) : reject("Project not found.");
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(p => p.sector.toLowerCase().includes(sector.toLowerCase()));
        filteredProjects.length > 0 ? resolve(filteredProjects) : reject("No projects found in this sector.");
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };