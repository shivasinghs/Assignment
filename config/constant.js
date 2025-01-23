const JWT = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const VALIDATOR = require('validatorjs');
const BCRYPT = require('bcryptjs');
const { Op } = require('sequelize');

module.exports = {
    JWT,
    uuidv4,
    VALIDATOR,
    BCRYPT,
    Op,
};
