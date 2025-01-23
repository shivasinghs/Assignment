const BCRYPT = require('../../config/constant.js');
const { Op } = require('../../config/constant.js');
const JWT = require('../../config/constant.js');
const Validator = require('../../config/constant.js');
const { validationRules } = require('../helper/validationRules.js');


const SignUp = async (req,res)=>{
  const {name,email,password,country,city,CompanyName} = req.body;
  
  const validation = new Validator(req.body, validationRules.User);
}
