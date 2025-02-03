const { User } = require("../models/index");
const moment = require("moment");

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const createOTP = async (userId) => {
  const otp = generateOtp();
  const expiresAt = moment().add(1, "days").unix();

  await User.update(
    { otp, otpExpiresAt: expiresAt },
    { where: { id: userId } }
  );

  return { otp, expiresAt };
};

const validateOTP = async (user, otp) => {

  
  if (!user || user.otp !== otp) {
    return null; 
  }

  if (user.otpExpiresAt < moment().unix()) {
    return null; 
  }

  return user;
};


module.exports = {
  createOTP,
  validateOTP
};
