'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phn: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    full_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    blood_gr: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    marrital_status: {
      type: DataTypes.ENUM('married', 'unmarried'),
      defaultValue: 'married',
      allowNull: false
    },
    nic: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    },
    phone_no: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    admit_status: {
      type: DataTypes.ENUM('admitted', 'discharged'),
      defaultValue: 'admitted',
      allowNull: false
    }
  }, 
  
  {
    tableName: 'patient',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Relationships
  Patient.associate = (models) => {
    Patient.hasMany(models.MedicalHx, {
      foreignKey: 'phn',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    Patient.hasMany(models.Admission, {
      foreignKey: 'phn',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  return Patient;
};
