const { DataTypes } = require('sequelize');
const db = require('../config/database');

const CompanyUsers = db.sequelize.define('CompanyUsers', {
    CompanyUserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'UserID'
        }
    },
    CompanyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Company',
            key: 'CompanyID'
        }
    },
    CompanyRoleID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'CompanyRoles',
            key: 'CompanyRoleID'
        }
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'CompanyUsers',
    timestamps: false,
});

module.exports = CompanyUsers;