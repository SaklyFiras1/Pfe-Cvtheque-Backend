const express=require('express');
const app = require('../index');
const router = express.Router();
const connection=require('../connection');
const jwt=require('jsonwebtoken')
const nodemailer=require('nodemailer')
var auth=require('../Services/authentification')
var verifrole=require('../Services/verifrole');
const { locals } = require('../index');
const Nexmo=require('nexmo');

const nexmo=new Nexmo({
    apiKey: '371a96ec',
    apiSecret:'eyy2AggbU0iUqkrk'
})
require('dotenv').config()
router.post('/send', (req, res) => {

    nexmo.message.sendSms(
         req.body.tonumber, req.body.message, {type: 'unicode'},
      (err, responseData) => {if (responseData) {console.log(responseData);}}
    );
    res.send('SMS Message Sent');
   
   });
router.post('/signup', (req, res) => {
  let user=req.body
query ="select email from user where email=?"
connection.query(query,[user.email],(err,results)=>{
    if(!err){
        if(results.length<=0){
            query="insert into user (username,email,password,ROLE,status,usertype,registerdate) values(?,?,?,'user','false',?,NOW())"
            connection.query(query,[user.username,user.email,user.password,user.usertype] ,(err,results)=>{
                if(!err){
                    
                    return res.status(200).json({message:"registred succesfully"})
                }
                else{
                 return res.status(500).json(err)
                }
            })

        }
   else{
        return res.status(501).json({message:" Email existe"})
   }
    }
    else{
   return res.status(500).json(err)
    }
});
})
router.post('/Login', (req, res) => {
    const user=req.body
  query="select id_user,email,password,status,ROLE from user where email=?"
  connection.query(query,[user.email],(err,results)=>{

    if(!err){
   if(results.length<=0||results[0].password !=user.password ){
       return res.status(401).json({message:'username or password incorrect'})
   }
   else if(results[0].password==user.password ){
     const response={email:results[0].email,ROLE:results[0].ROLE,id:results[0].id_user}
     const accesstoken=jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'4h'})
     
     res.status(200).json({token:accesstoken,message:'Login succesfully'})
   }
   else {
       return res.status(401).json({message:'something went wrong please try again later'})
   }

    }
    else{
    return res.status(500).json(err)
    }

})})
var transporter=nodemailer.createTransport({
    service:'hotmail',
  
    auth:{
     user:process.env.EMAIL,
     pass:process.env.PASSWORD
    }
})
router.post('/forgetPassword',(req,res)=>{
    const user=req.body
    query="select email,password from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0){
             return res.status(200).json({message:'password send succesfully to your email'})
            }
            else{
                var mailoption={
                    from:process.env.EMAIL,
                    to:results[0].email,
                    subject:"your cordinations To Login to workscout",
                    html:'<p><b>YOUR LOGIN DETAILS TO YOUR ACCOUNT WORKSCOUT</b><br><b>your email :</b>'+results[0].email+'<br><b>your password :</b>'+results[0].password+'<br><a href="http://localhost:4200/"> PRESS HERE TO LOGIN TO WORKSCOUT</a></p>'
                }
            
            transporter.sendMail(mailoption,(error,information)=>{
                if (!error){
                    console.log('email sent',information.response)
                }
                else{
                    console.log(error)
                }

            })
            return res.status(200).json({message:'Login Details send succesfully to your email'})
        }
        }
        else{
            res.status(500).json(err)
        }
    })
})




router.get('/checktoken',auth.authentificatetoken,(req,res)=>{
    res.status(200).json({message:"true"})
})



router.get('/get',auth.authentificatetoken,verifrole.verifrole, (req, res) => {
   var query="select id_user,username,email,password,ROLE,status from user where ROLE='user'"
     connection.query(query,(err,results)=>{
         if(!err){
              res.status(200).json(results)
         }
         else{
             res.send({message:'error'})
         }
     })
});
router.post('/changepassword',auth.authentificatetoken,(req,res)=>{
    const user=req.body
 const email=res.locals.email
    var query="select password from user where email=? and password=?" ;
    connection.query(query,[email,user.oldpassword],(err,results)=>{
        if(!err){
           if(results.length<=0){
             return res.json({message:'incorrect old password '});
           }
           else if (results[0].password ==user.oldpassword ){
               var query= "update user set password=? where email=?" ;
             connection.query(query,[user.newpassword,email],(err,results)=>{
                 if(err){

                   return  res.json({message:"something went wrong"}) ;
                 }
                 else{
                     return res.json({message:"password successfully changed"});
                 }
                })
        }
        }
        else{
    return res.sendStatus(500).json({message:error})
        }
    }) 
}) 

router.post('/addprof',auth.authentificatetoken,(req,res,next)=>{
    const profil=req.body
    let photourl=req.files.photourl
    let pdfcv=req.files.pdfcv
    var image="http://localhost:3000/images"+photourl.name
    var fich="http://localhost:3000/pdf"+pdfcv.name
    var query ="insert into user( titreprofessionelle=?,location=?,photourl=?,aproposdemoi=?,university=?,niveauetude=?,diplomes=? ,detailleexperience=?,langues=?,skills=?,numerodetelephone=?,datedenaissance=?,linkedin=?,pdfcv=?)values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
  connection.query(query,[profil.Nometprenom,profil.Datedenaissance,profil.Email,profil.TitreProfessionnelle,profil.Location,[image],profil.AProposDeMois,profil.University,profil.Niveauetudes,profil.Diplomes,profil.Postrecherché ,profil.Detailleexp,profil.Certificats,profil.Langues,[fich]],(err,results)=>{
      if(!err){
        photourl.mv('./public/images/'+photourl.name);
        pdfcv.mv('./public/pdf/'+pdfcv.name);
          res.status(200).json({message:"your profil is created successfully"})
      }
      else{
          res.status(500).json({message:err})
      }
  })
})
router.get('/getprofil',auth.authentificatetoken,(req,res,next)=>{
    var id=res.locals.id
    var query="select  username,email,certificats,badge,titreprofessionelle,location,photourl,aproposdemoi,university,niveauetude,diplomes,detailleexperience,langues,linkedin,skills,numerodetelephone,datedenaissance,certificats from user where id_user=?;"
    connection.query(query,[id],(err,results)=>{
        if(!err){
        res.status(200).json(results)
        }
        else{
            res.status(500).json({message:err})
        }
    })})

router.get('/getcurrentuser',auth.authentificatetoken,(req,res,next)=>{
    var id=res.locals.id
    var query="select usertype,companyurl,username,email,certificats,badge,titreprofessionelle,location,photourl,aproposdemoi,university,niveauetude,diplomes,detailleexperience,langues,linkedin,skills,numerodetelephone,datedenaissance,certificats,pdfcv from user where id_user=?"
    connection.query(query,[id],(err,results)=>{
        if(!err){
        res.status(200).json(results)
        }
        else{
            res.status(500).json({message:err})
        }
    })})
    
router.patch('/updateprof',auth.authentificatetoken,(req,res)=>{
const user=req.body
let  pdfcv=req.files.pdfcv
var pdfcva="http://localhost:3000/images/"+pdfcv.name
var query="update user set pdfcv=?,titreprofessionelle=?,location=?,aproposdemoi=?,university=?,niveauetude=?,diplomes=? ,detailleexperience=?,langues=?,skills=?,numerodetelephone=?,linkedin=?,certificats=? ,datedenaissance=?,username=? where id_user=? "
connection.query(query,[[pdfcva],user.titreprofessionelle,user.location,user.aproposdemoi,user.university,user.niveauetude,user.diplomes,user.detailleexperience,user.langues,user.skills,user.numerodetelephone,user.linkedin,user.certificats,user.datedenaissance,user.username,[res.locals.id] ],(err,result)=>{
    if(!err){
        pdfcv.mv('./public/images/'+pdfcv.name)
        res.status(200).json({messge:" your profil is successfully updated "})

    }
    else{
   res.status(500).json({message:err})
   console.log(err)
    }
})
})
router.patch('/updatecompany',auth.authentificatetoken,(req,res)=>{
    const user=req.body
    
    var query="update user set location=?,numerodetelephone=?,companyurl=?,username=? where id_user=? "
    connection.query(query,[user.location,user.numerodetelephone,user.companyurl,user.username,[res.locals.id] ],(err,result)=>{
        if(!err){
        
            res.status(200).json({messge:" your profil is successfully updated "})
    
        }
        else{
       res.status(500).json({message:err})
  
        }
    })
    })
router.patch('/updateusertype',auth.authentificatetoken,(req,res)=>{
    const id=res.locals.id
    var user=req.body
    var query="update user set usertype=? where id_user=? "
    connection.query(query,[user.usertype,[res.locals.id] ],(err,result)=>{
        if(!err){
            res.status(200).json({messge:"Usertype changed Successfully "})
    
        }
        else{
       res.status(500).json({message:err})
     
        }
    })
    })

    router.patch('/updateemail',auth.authentificatetoken,(req,res,next)=>{
        const user=req.body
  const email=res.locals.email
     const id=res.locals.id
     
               if(req.body.oldemail == email) {
                var k="select email from user where email=? "
                connection.query(k,[user.newemail],(err,resull)=>{
                    console.log(err)
                    if(!err){
                    if(resull.length!=0){
                      
                        return res.status(500).json({message:"email exists "});
                    }
                        else {
                            var query= "update user set email=? where id_user=?" ;
                            connection.query(query,[user.newemail,[id]],(err,results)=>{
                                if(err){
                            
                                    return res.status(500).json({message:"wrong"});
                               
                                }
                                else{
                                  
                                    return res.status(200).json({message:"Email updated successfully u must relogin "});
                                }
                               
                               })
                       }

                           
                        }
                      
                      
                    }

            
                )
               }   
                
         else{
              
            return res.status(500).json({message:'incorrect old email '});
          }
             
            }
            
          
        ) 
    
 
    

router.patch('/updateprofilephoto',auth.authentificatetoken,(req,res)=>{
    let photourl=req.files.photourl
    var image="http://localhost:3000/images/"+photourl.name
const id=res.locals.id
var query="update user set photourl=? where id_user=? "
connection.query(query,[[image ],[id]],(err,result)=>{
    if(!err){
        photourl.mv('./public/images/'+photourl.name)
       return res.status(200).json({message:"photo updated succesfully"})

    }
    else{
  return res.status(500).json({message:"something wrong"})
    }
})
})

router.get('/userprofil',auth.authentificatetoken,(req,res)=>{
const id=res.locals.id
    var query="select location from user where id_user="
    connection.query(query,id,(err,result)=>{
        if(err)
        res.json(err)
        else{
            res.status(200).json({message:'welcome to ur profil'})

        }
    })
})

  
  
  
  
    router.post('/contact',auth.authentificatetoken,(req,res)=>{

         var query="select password  from user where id_user=?"
         connection.query(query,res.locals.id,(err,results)=>{
            if(err){
        
                return res.status(500).json({message:'Feedback sended Successfully To Admin '})

            }
            else{
        
                var contact=nodemailer.createTransport({
                    service:'hotmail',
                    auth:{
                        user:res.locals.email,
                        pass:results[0].password
                    }
                       
                    })
                  
                  var mailoption={
                      from:req.body.email,
                      to:process.env.Email,
                      subject:`workscout feedback users  from ${req.body.email}`,
                      text:req.body.subject
                  }
               
                
              
            contact.sendMail(mailoption,(error,information)=>{
                  if (!error){
                      console.log('email sent',information.response)
                  }
                  else{
                      console.log(error)
                  }
                         
              })
              return res.status(200).json({message:'Feedback sended Successfully To Admin '})
    }})}

      )
    
    router.get('/photo',auth.authentificatetoken,(err,res)=>{
        var query="select photourl from user where id_user=? "
        var id=res.locals.id
        connection.query(query,[id],(err,result)=>{
            if(!err){
                res.status(200).json(result)
            }
            else{
    res.status(500).json({message:err})
            }
        })
        
    })
    router.get('/getbadge',auth.authentificatetoken,(err,res)=>{
        var query="select badge from user where id_user=? "
        var idk=res.locals.id
        connection.query(query,[idk],(err,result)=>{
            if(!err){
          res.status(200).json(result)
            }
            else{
          res.status(500).json(err)
            }
        })
        
    })







module.exports=router
