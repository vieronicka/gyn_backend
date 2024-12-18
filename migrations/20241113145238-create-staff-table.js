'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('staff', {
      id: {
        type: Sequelize.INTEGER(10),
        primaryKey: true,
        autoIncrement: true
      },
      full_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone_no: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('consultant', 'registrar', 'medical_officer', 'data_entry', 'superadmin'),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'pending', 'inactive'),
        defaultValue: 'pending',
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      otp_expires: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('staff');
  }
};
