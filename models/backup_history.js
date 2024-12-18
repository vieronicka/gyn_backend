'use strict';

module.exports = (sequelize, DataTypes) => {
  const BackupHistory = sequelize.define('BackupHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    backup_date: {
      type: DataTypes.DATE, // Use DATE instead of TIMESTAMP
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'backup_history',
    timestamps: false
  });

  return BackupHistory;
};
