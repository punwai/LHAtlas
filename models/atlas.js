'use strict';
module.exports = (sequelize, DataTypes) => {
  const Atlas = sequelize.define('Atlas', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    location: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    website: DataTypes.STRING,
    patients: DataTypes.INTEGER,
    email: DataTypes.STRING
  }, {});
  Atlas.associate = function(models) {
    Atlas.belongsTo(models.Product, {as: "product"});
    Atlas.belongsToMany(models.Version, { through: "AtlasVersion",
    foreignKey: 'atlasId',
    Foreignunique: false,
    as: 'products'
  })
  };
  return Atlas;
};