'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Investigation = sequelize.define('Investigation', {
    id: {
      type: DataTypes.INTEGER(5),
      primaryKey: true,
      autoIncrement: true
    },
    visit_id: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    fbc_wbc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fbc_hb: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fbc_pt: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ufr_wc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ufr_rc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ufr_protein: {
      type: DataTypes.ENUM('Nil','1+','2+','3+','Trace'),
      allowNull: false
    },
    se_k: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    se_na: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    crp: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fbs: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppbs_ab: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppbs_al: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppbs_ad: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lft_alt: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lft_ast: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    invest_other: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    scan_mri: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    scan_ct: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    uss_tas: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    uss_tus: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    scan_types: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'investigation',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Relationships
  Investigation.associate = function(models) {
  Investigation.belongsTo(sequelize.models.Treatment, {
    foreignKey: 'visit_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });}

  return Investigation;
};
