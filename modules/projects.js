require("dotenv").config();
require("pg");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Define Sector model
const Sector = sequelize.define(
  "Sector",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sector_name: DataTypes.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Define Project model
const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    feature_img_url: DataTypes.STRING,
    summary_short: DataTypes.TEXT,
    intro_short: DataTypes.TEXT,
    impact: DataTypes.TEXT,
    original_source_url: DataTypes.STRING,
    sector_id: DataTypes.INTEGER,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Define relationship
Project.belongsTo(Sector, { foreignKey: "sector_id" });

// Initialize DB
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

// Get all projects with sector data
function getAllProjects() {
  return new Promise((resolve, reject) => {
    Project.findAll({ include: [Sector] })
      .then((data) => resolve(data))
      .catch(() => reject("No projects available."));
  });
}

// Get one project by ID
function getProjectById(id) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: { id: id },
    })
      .then((data) => {
        data.length > 0 ? resolve(data[0]) : reject("Project not found.");
      })
      .catch(() => reject("Project not found."));
  });
}

// Get all projects by sector name
function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        "$Sector.sector_name$": {
          [Op.iLike]: `%${sector}%`,
        },
      },
    })
      .then((data) => {
        data.length > 0
          ? resolve(data)
          : reject("No projects found in this sector.");
      })
      .catch(() => reject("No projects found in this sector."));
  });
}

// ✅ NEW: Add a new project
function addProject(projectData) {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => resolve())
      .catch((err) => reject(err.errors[0].message));
  });
}

// ✅ NEW: Get all sectors
function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll()
      .then((data) => resolve(data))
      .catch(() => reject("Unable to fetch sectors"));
  });
}

// ✅ NEW: Update a project
function updateProject(id, updatedData) {
  return new Promise((resolve, reject) => {
    Project.update(updatedData, {
      where: { id: id },
    })
      .then(([rowsUpdated]) => {
        rowsUpdated > 0 ? resolve() : reject("No rows updated");
      })
      .catch((err) => reject(err.errors ? err.errors[0].message : err.message));
  });
}

// ✅ NEW: Delete a project
function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({
      where: { id: id },
    })
      .then((rowsDeleted) => {
        rowsDeleted > 0
          ? resolve()
          : reject("Project not found or already deleted");
      })
      .catch((err) => reject(err.message));
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject, // ✅ export new function
  getAllSectors, // ✅ export new function
  Project,
  updateProject, // ✅ export new function
  deleteProject, // ✅ export new function
  Sector,
  sequelize,
};
