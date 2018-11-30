'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    marker_pcolor: DataTypes.STRING,
    marker_scolor: DataTypes.STRING
  }, {});
  Product.associate = function(models) {
    Product.hasMany(models.Version, {foreignKey: 'productId', as: 'versions'})

  };
  return Product;
};