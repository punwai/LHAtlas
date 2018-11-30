const Sequelize = require('sequelize')
const UserModel = require('./models/user')
const AtlasModel = require('./models/atlas')
const ProductsModel = require('./models/products')
const VersionsModel = require('./models/versions')
require('dotenv').config()

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   host: process.env.DB_HOST,
//   port: 3306,
//   dialect: 'mysql',
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// })


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
})

const User = UserModel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const Atlas = AtlasModel(sequelize, Sequelize)
const Products = ProductsModel(sequelize, Sequelize)
const Versions = VersionsModel(sequelize, Sequelize)

const AtlasVersion = sequelize.define('atlasversiontest', {})

Atlas.belongsToMany(Versions, { through: AtlasVersion, unique: false })
Versions.belongsToMany(Atlas, { through: AtlasVersion, unique: false })


Versions.belongsTo(Products);

sequelize.sync()
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  User,
  Atlas,
  Versions,
  Products
}
