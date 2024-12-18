// migrations/YYYYMMDDHHMMSS-create_backup_history_table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('backup_history', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      backup_date: {
  type: Sequelize.DATE,
  defaultValue: Sequelize.NOW
}

    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('backup_history');
  }
};
