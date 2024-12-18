'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_hx', {
      id: {
        type: Sequelize.INTEGER(25),
        primaryKey: true,
        autoIncrement: true
      },
      phn: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      allergy: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      past_med: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      past_med_other: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      past_surg: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      past_surg_other: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      hx_diseases: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      hx_cancer: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      hx_cancer_other: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      diagnosis: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      other: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      
      menarche_age: {
        type: Sequelize.INTEGER(4),
        allowNull: false
      },
      menopausal_age: {
        type: Sequelize.INTEGER(5),
        allowNull: false
      },
      lmp: {
        type: Sequelize.INTEGER(5),
        allowNull: false
      },
      menstrual_cycle: {
        type: Sequelize.ENUM('regular', 'irregular'),
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

    await queryInterface.addConstraint('medical_hx', {
      fields: ['phn'],
      type: 'foreign key',
      name: 'medical_hx_patient_fk',
      references: {
        table: 'patient',
        field: 'phn'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medical_hx');
  }
};
