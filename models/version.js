'use strict';
module.exports = (sequelize, DataTypes) => {
  const Version = sequelize.define('Version', {
    name: DataTypes.STRING
  }, {});
  Version.associate = function(models) {
    Version.belongsTo(models.Product, {as: "product"});
    Version.belongsToMany(models.Atlas, { through: "AtlasVersion", 
    foreignKey: 'versionId',
    as: 'atlas',
    unique: false })
  };
  return Version;
};