'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admission', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      phn: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      bht: {
        type: Sequelize.STRING(11),
        allowNull: false
      },
      ward_no: {
        type: Sequelize.INTEGER(5),
        defaultValue: 21,
        allowNull: false
      },
      consultant: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('admit', 'discharged'),
        defaultValue: 'admit',
        allowNull: false
      },
      add_count: {
        type: Sequelize.INTEGER(5),
        allowNull: false
      },
      height: {
        type: Sequelize.DECIMAL(10, 0),
        allowNull: false
      },
      weight: {
        type: Sequelize.DECIMAL(10, 0),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addConstraint('admission', {
      fields: ['phn'],
      type: 'foreign key',
      name: 'admission_patient_fk',
      references: {
        table: 'patient',
        field: 'phn'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('admission');
  }
};
