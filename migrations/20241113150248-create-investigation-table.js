'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('investigation', {
      id: {
        type: Sequelize.INTEGER(5),
        primaryKey: true,
        autoIncrement: true
      },
      visit_id: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      fbc_wbc: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fbc_hb: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fbc_pt: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ufr_wc: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ufr_rc: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ufr_protein: {
        type: Sequelize.ENUM('Nil','1+','2+','3+','Trace'),
        allowNull: false
      },
      se_k: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      se_na: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      crp: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fbs: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ppbs_ab: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ppbs_al: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      ppbs_ad: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      lft_alt: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      lft_ast: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      invest_other: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      scan_mri: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      scan_ct: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      uss_tas: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      uss_tus: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      scan_types: {
        type: Sequelize.STRING(50),
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

    await queryInterface.addConstraint('investigation', {
      fields: ['visit_id'],
      type: 'foreign key',
      name: 'investigation_visit_fk',
      references: {
        table: 'treatment',
        field: 'visit_id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('investigation');
  }
};
