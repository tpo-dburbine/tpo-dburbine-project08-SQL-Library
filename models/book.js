'use strict';
const { Sequelize } = require('sequelize');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };

  Book.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          // custom error message
          msg: 'Please provide a value, "title" cannot be empty.'
        },
        notEmpty: {
          // custom error message
          msg: 'Please provide a value, "title" cannot be empty.'
        }
      }
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          // custom error message
          msg: 'Please provide a value, "author" cannot be empty.'
        },
        notEmpty: {
          // custom error message
          msg: 'Please provide a value, "author" cannot be empty.'
        }
      }
    },
    genre: DataTypes.STRING,
    year: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};