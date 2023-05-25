require('dotenv').config()
const jwt=require('jsonwebtoken')
function athentificatetoken(req,res,next){
 const authheader=req.headers['authorization']
 const token=authheader && authheader.split(' ')[1]
 if(token==0)
   res.sendStatus(401) 

     jwt.verify(token,process.env.ACCESS_TOKEN,(err,response)=>{
          if(err){
          
          return res.sendStatus(403)}
           
          res.locals=response
           next()
     })
     
 }


module.exports={authentificatetoken:athentificatetoken}