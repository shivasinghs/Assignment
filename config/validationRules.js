const Validator = require('./constant');

const validationRules = {
  User: {
    name: 'required|string|min:3|max:30',
    email: 'required|email',
    password: 'required|string|min:8|max:16',
    country: 'required|string|max:30',
    city: 'required|string|max:30',
    company:'required|string|max:64'
  },
};

module.exports = {
  validationRules
};
