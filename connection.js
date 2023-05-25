const mysql= require('mysql')
require('dotenv').config()
var connection=mysql.createConnection({
port:process.env.DB_PORT,
user:process.env.DB_USERNAME,
password:process.env.DB_PASSWORD,
host:process.env.DB_HOST,
database:process.env.DB_NAME,
})
connection.connect((err)=>{
    if(!err) console.log('connected cvtheque')
    else 
    console.log({message:err})
})
module.exports=connection