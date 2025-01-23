const BCRYPT = require('../../config/constant.js');
const { Op } = require('../../config/constant.js');
const JWT = require('../../config/constant.js');
const Validator = require('../../config/constant.js');
const { validationRules } = require('../../config/validationRules.js');


const SignUp = async (req,res)=>{
  const {name,email,password,country,city,CompanyName} = req.body;
  
  const validation = new Validator(req.body, validationRules.User);

  if (validation.fails()) {
    return res.status(400).json({ error: validation.errors.all() });
  }

  try {
    const existingUser = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    })
   
  } catch (error) {
  
  }
};

