require('dotenv').config()
function verifrole(req,res,next){
    if (res.locals.ROLE==process.env.USER){
        console.log(res.locals.ROLE)
     res.sendStatus(401)
        
     }

     
    else
    next()
}
module.exports={verifrole:verifrole}