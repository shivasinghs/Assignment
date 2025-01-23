const Admin = require('../models/Admin/index')

const createAdmin = ()=>{
   try {
    const admin = Admin.findAll({
        where:{email:'abc@gmail.com'},
        limit:1
    })
    if(admin.length === 0){
        const newAdmin = Admin.create({
            id,
            name,
            email,
            password,
            country
        })
    }
   } catch (error) {
     console.log("Error in bootStrap.js",error);
   }
}