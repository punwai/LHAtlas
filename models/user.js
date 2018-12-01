'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    admin: DataTypes.BOOLEAN
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Atlas, {foreignKey: 'creatorId', as: 'creator'})
  };
  return User;
};