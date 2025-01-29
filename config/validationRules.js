const commonRules = {
  password: 'required|string|regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
};

const validationRules = {
  User: {
    name: "required|string|min:3|max:30",
    email: "required|email",
    password: commonRules.password,
    countryId: "required|string",
    cityId: "required|string",
    companyName: "string|max:64"
  },
  Admin: {
    email: "required|email",
    password: commonRules.password,
  },
  Category: {
    categoryId :"required|string",
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:100",
    "translations.*.lang": "required|string|min:2|max:10"
  },
  SubCategory: {
    categoryId :"required|string",
    subCategoryId: "required|string",
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:100",
    "translations.*.lang": "required|string|min:2|max:10"
  },
  Country: {
    countryId :"required|string",
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:100",
    "translations.*.lang": "required|string|min:2|max:10"
  },
  City: {
    countryId :"required|string",
    cityId : "required|string",
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:100",
    "translations.*.lang": "required|string|min:2|max:10"
  },
  Account: {
    categoryId: "required|string",
    subCategoryId: "required|string",
    description: "string|max:100",
    translations: "required|array",
    accountId : "required|string",
    "translations.*.name": "required|string|min:3|max:30",
    "translations.*.lang": "required|string|min:2|max:10"
  },
};

module.exports = {
  validationRules
};