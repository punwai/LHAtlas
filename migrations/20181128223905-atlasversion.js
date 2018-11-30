'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('AtlasVersion',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        atlasId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Atlas',
            key: 'id'
          },
          allowNull: false
        },
        versionId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Version',
            key: 'id'
          },
          allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      }
  )},
down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('AtlasVersion')
  }
};