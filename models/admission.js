'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Admission = sequelize.define('Admission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phn: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    bht: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    ward_no: {
      type: DataTypes.INTEGER(5),
      defaultValue: 21,
      allowNull: false,
    },
    consultant: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('admit', 'discharged'),
      defaultValue: 'admit',
      allowNull: false,
    },
    add_count: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'admission',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  // Remove the 'Staff' association
  Admission.associate = function(models) {
    // Define relationships with other models
    Admission.belongsTo(models.Patient, { foreignKey: 'phn', targetKey: 'phn', onDelete: 'CASCADE' });
    Admission.hasMany(models.Treatment, { foreignKey: 'admission_id', onDelete: 'CASCADE' });
  };

  return Admission;
};
