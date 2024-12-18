'use strict';

/** @type {import('sequelize-cli').Migration} */
//const { Sequelize, DataTypes } = require('sequelize'); // Change this to CommonJS-style require

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patient', {
      id: {
        type: Sequelize.INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      phn: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      full_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      blood_gr: {
        type: Sequelize.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: false
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      marrital_status: {
        type: Sequelize.ENUM('married', 'unmarried'),
        defaultValue: 'married',
        allowNull: false
      },
      nic: {
        type: Sequelize.STRING(12),
        allowNull: false
      },
      phone_no: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      admit_status: {
        type: Sequelize.ENUM('admitted', 'discharged'),
        defaultValue: 'admitted',
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

    await queryInterface.addConstraint('patient', {
      fields: ['nic'],
      type: 'unique',
      name: 'unique_patient_nic'
    });

    await queryInterface.addConstraint('patient', {
      fields: ['phn'],
      type: 'unique',
      name: 'unique_patient_phn'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patient');
  }
};
