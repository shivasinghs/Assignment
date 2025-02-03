const { uuidv4, VALIDATOR, BCRYPT, Op, HTTP_STATUS_CODE, TOKEN_EXPIRY,PATH } = require("../../../../config/constants");
const { User, MstCountry, MstCity } = require("../../../models/index");
const { generateToken } = require("../../../helper/auth/generateJWTToken");
const { validationRules } = require("../../../../config/validationRules");
const i18n = require("../../../../config/i18n");
const sendEmail = require('../../../helper/sendEmail');


const SignUp = async (req, res) => {
  try {
    const { name, email, password, countryId, cityId, companyName } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.User);
    
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const existingUser = await User.findOne({
      where: { email: email },
      attributes: ["id"]
    });

    if (existingUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("User.Auth.EMAIL_ALREADY_EXISTS"),
        data: "",
        err: null,
      });
    }

    const hashedPassword = await BCRYPT.hash(password, 10);

    const otp = Math.floor(1000 + Math.random() * 9000); 
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; 

    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      countryId,
      cityId,
      companyName,
      otp,
      otpExpiresAt : expiresAt,
    });
    
    const attachment = [
      {
        filename: 'signup.jpeg',
        path: PATH.join(__dirname, '../../../../images/signup.jpeg'),
        cid: 'signup'
      },
      {
        filename: 'download2.jpeg',
        path: PATH.join(__dirname, '../../../../images/usersignup.jpeg'),
      }
    ]

    await sendEmail(newUser.email, 'Welcome to our platform', 'otp-template', {
      name: newUser.name,
      otp,
    }, attachment);

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("User.Auth.USER_CREATED"),
      data: { id: newUser.id, name: newUser.name },
      err: null,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const login = async (req, res) => { 
  try {
    const { email, password } = req.body;

    const validation = new VALIDATOR(req.body, {
      email: validationRules.User.email,
      password: validationRules.User.password
    });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const user = await User.findOne({
      where: { email: email },
      attributes: ["id", "password", "isVerified"]
    });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_CREDENTIALS"),
        data: "",
        err: null,
      });
    }

    if (!user.isVerified) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        msg: i18n.__("User.Auth.USER_NOT_VERIFIED"),
        data: "",
        err: null,
      });
    }

    const isPasswordValid = await BCRYPT.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_CREDENTIALS"),
        data: "",
        err: null,
      });
    }

    const token = generateToken(
      { userId: user.id, email: user.email },
      TOKEN_EXPIRY
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("User.Auth.LOGIN_SUCCESS"),
      data: { userId: user.id, email: user.email, token },
      err: null,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: "",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, countryId, cityId, companyName } = req.body;
    const userId = req.user.id;

    const validation = new VALIDATOR(req.body, {
      name: validationRules.User.name,
      countryId: validationRules.User.countryId,
      cityId: validationRules.User.cityId,
      companyName: validationRules.User.companyName
    });

    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const user = await User.findOne({ where: { id: userId }, attributes: ['id'] });
    
    if (!user) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("User.Auth.USER_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    const updatedData = {
      name: name,
      countryId: countryId,
      cityId: cityId,
      companyName: companyName
    };

    user.updatedAt = Math.floor(Date.now() / 1000);
    user.updatedBy = userId;
    await user.update(updatedData);

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("User.Auth.PROFILE_UPDATED"),
      data: { userId },
      err: null,
    });
  } catch (error) {
    console.error("Error in updating profile:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: "",
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'otp', 'otpExpiresAt']
    });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__('messages.USER_NOT_FOUND'),
        err: null,
      });
    }

    if (user.otp !== otp) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__('messages.INVALID_OTP'),
        err: null,
      });
    }

    const currentTime = Date.now();

    if (user.otpExpiresAt < currentTime) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__('messages.OTP_EXPIRED'),
        err: null,
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__('User.Auth.OTP_VERIFIED'),
      data: { userId },
      err: null,
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__('messages.INTERNAL_ERROR'),
      err: error.message,
    });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const validation = new VALIDATOR(req.body, { email: validationRules.User.email });
    
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const user = await User.findOne({
      where: { email: email },
      attributes: ["id", "name"],
    });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("User.AUTH.NOT_FOUND"),
        err: null,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000); 
    const expiresAt = Date.now() + 10 * 60 * 1000; 

    const attachment = [
      {
        filename: "download.jpeg",
        path: PATH.join(__dirname, "../../../../images/download.jpeg"),
        cid : 'img1'
      },
    ];

    await sendEmail( email, "Reset Your Password", "forgotPassword", {
      name: user.name,
      otp,
    }, attachment);

    user.forgotPasswordOtp = otp;
    user.forgotPasswordOtpExpiresAt = expiresAt;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("User.Auth.PASSWORD_RESET_EMAIL_SENT"),
      err: null,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      err: error.message,
    });
  }
};


const changePassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const validation = new VALIDATOR(req.body, { newPassword: validationRules.User.password });
    
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "forgotPasswordOtp", "forgotPasswordOtpExpiresAt", "password"],
    });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("User.Auth.USER_NOT_FOUND"),
        err: null,
      });
    }

    if (user.forgotPasswordOtp !== otp) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_OTP"),
        err: null,
      });
    }

    const currentTime = Date.now();
    if (user.forgotPasswordOtpExpiresAt < currentTime) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.OTP_EXPIRED"),
        err: null,
      });
    }

    const hashedPassword = await BCRYPT.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.updatedAt = Math.floor(Date.now() / 1000);
    user.updatedBy = userId;
    user.forgotPasswordOtp = null;
    user.forgotPasswordOtpExpiresAt = null;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("USER.AUTH.PASSWORD_CHANGED"),
      err: null,
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      err: error.message,
    });
  }
};

module.exports = {
  SignUp,
  login,
  updateProfile,
  verifyOTP,
  forgotPassword,
  changePassword
};
