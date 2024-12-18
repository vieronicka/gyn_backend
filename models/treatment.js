'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Treatment = sequelize.define('Treatment', {
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    visit_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true
    },
    admission_id: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
    visit_count: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    seen_by: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    complaints: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    abnormal_bleeding: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    complaint_other: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    exam_bpa: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    exam_bpb: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    exam_pulse: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    exam_abdominal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exam_gynaecology: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manage_minor_eua: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manage_minor_eb: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manage_major: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manage_medical: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manage_surgical: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'treatment',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Relationships
  Treatment.belongsTo(sequelize.models.Admission, {
    foreignKey: 'admission_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Treatment.hasMany(sequelize.models.Investigation, {
    foreignKey: 'visit_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  return Treatment;
};
