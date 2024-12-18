'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('treatment', {
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      visit_id: {
        type: Sequelize.STRING(15),
        allowNull: false,
        primaryKey: true // Assuming visit_id is a unique identifier
      },
      admission_id: {
        type: Sequelize.STRING(13),
        allowNull: false
      },
      visit_count: {
        type: Sequelize.INTEGER(5),
        allowNull: false
      },
      seen_by: {
        type: Sequelize.STRING(25),
        allowNull: false
      },
      complaints: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      abnormal_bleeding: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      complaint_other: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      exam_bpa: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      exam_bpb: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      exam_pulse: {
        type: Sequelize.INTEGER(10),
        allowNull: true
      },
      exam_abdominal: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      exam_gynaecology: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manage_minor_eua: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manage_minor_eb: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manage_major: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manage_medical: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      manage_surgical: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Adding foreign key constraints (assuming the relationships to `admission` and `investigation` tables)
    // await queryInterface.addConstraint('treatment', {
    //   fields: ['admission_id'],
    //   type: 'foreign key',
    //   name: 'treatment_admission_fk',
    //   references: {
    //     table: 'admission',
    //     field: 'id'
    //   },
    //   onDelete: 'CASCADE',
    //   onUpdate: 'CASCADE'
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('treatment');
  }
};
