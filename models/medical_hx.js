'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const MedicalHx = sequelize.define('MedicalHx', {
    id: {
      type: DataTypes.INTEGER(25),
      primaryKey: true,
      autoIncrement: true
    },
    phn: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    allergy: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    past_med: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    past_med_other: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    past_surg: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    past_surg_other: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    hx_diseases: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    hx_cancer: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    hx_cancer_other: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    other: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    menarche_age: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    menopausal_age: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    lmp: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    menstrual_cycle: {
      type: DataTypes.ENUM('regular', 'irregular'),
      allowNull: false
    }
  }, {
    tableName: 'medical_hx',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Relationships
  MedicalHx.associate = function(models) {
  MedicalHx.belongsTo(sequelize.models.Patient, {
    foreignKey: 'phn',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });}

  return MedicalHx;
};
