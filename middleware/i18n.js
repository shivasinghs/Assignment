const i18n = require("../config/i18n");


const selectLanguage = (req, res, next) => {
  // get language from request header
  const lang = req.headers["accept-language"];

  // set language to i18n if it is valid and available in locales else set to default language
  if (lang && i18n.getLocales().includes(lang)) {
    i18n.setLocale(lang);
  } else {
    i18n.setLocale("en");
  }
  next();
};

module.exports = selectLanguage;