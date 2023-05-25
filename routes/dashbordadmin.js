const express = require("express");
const router = express.Router();
const connection = require("../connection");
var auth = require("../Services/authentification");
var verifrole = require("../Services/verifrole");
var app = require("../index");
const nodemailer=require('nodemailer')

router.get("/getjobannoncesbyid/:id",auth.authentificatetoken, (req, res, next) => {
    var jobid = req.params.id;
    var query =
      "select * from job where jobid=?";
    connection.query(query, [jobid], (err, results) => {
      if (!err) {
        res.status(200).json(results);
      } else {
        res.status(500).json({ message: err });
      }
    });
  });


  router.get('/getannoncedemandes',auth.authentificatetoken, (req, res, next) => {
    var query =
      "select jobid ,iduser,jobtitle,companyname,gouvernement,jobtype,jobcategorie,Descriptionj,salary,companyurl,logourl,closingdate,companyemail,dateposte,hours ,jobrequirement,status from job ORDER BY dateposte DESC  "
    connection.query(query,(err, results) => {
      if (!err) {
        res.status(200).json(results);
      } else {
        res.status(500).json({ message: err });
      }
    });
  });
  router.delete('/deletejobbyid/:id',auth.authentificatetoken, (req, res, next) => {
    var jobid=req.params.id ;
    var query = "delete from job where jobid=?"
    connection.query(query,[jobid],(err, results) => {
      if (!err) {
        
        res.status(200).json({message:'job annonce deleted'});
      } else {
        res.status(500).json({ message: err });
      }
    })
  });

  
refuser=nodemailer.createTransport({
  service:'gmail',
  auth:{
      user:process.env.Email,
      pass:process.env.Password
  }

}
)




  router.post('/refuser',auth.authentificatetoken,(req,res)=>{

          
                var mailoption={
                    from:process.env.EMAIL,
                    to:req.body.to,
                    subject:`Your Job Annonce Is Refused`,
                    text:req.body.text
                }
            
            refuser.sendMail(mailoption,(error,information)=>{
                if (!error){
                    console.log('Admin Email sent',information.response)
                } 
                else{
                    console.log(error)
                }
                       
            })
            return res.status(200).json({message:'Email sended successfully To Our Client '})
        }
    )
    router.post('/postjobreq/:id',auth.authentificatetoken,(req,res,next)=>{
      var date=req.body
 var jobid=req.params.id
 var query="update job set status= 'published' where jobid=?"
 connection.query(query,[jobid],(err,result)=>{
   if(err){
     
    res.status(500).json({message:'Job  req not found'})
   }         
   else{
               
        var jo="select iduser from job where jobid=? "
        connection.query(jo,[jobid],(err,results)=>{
          var k="select photourl from user where id_user=?"
          connection.query(k,res.locals.id,(err,resulo)=>{
       
         var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
          connection.query(q,[[results[0].iduser,resulo[0].photourl,'Admin Accepted Your Job Annonce  '],date.date],(err,respo)=>{
            if(err){
              res.status(500).json({message:err})
            }
            else{
              res.status(200).json({message:'Job Accepted Succesfully'})
               
            
            }
           
      })
    }
    )
     })
      
          }         
         
      }
      )
      }
 
    )
   router.patch('/refusjob/:id',auth.authentificatetoken,(req,res)=>{
    var jobid=req.params.id
    var date=req.body
    var query ="update job set status='refused' where jobid=?"
    connection.query(query,[jobid],(err,result)=>{
      if(!err){
        
        var jo="select iduser from job where jobid=? "
        connection.query(jo,[jobid],(err,results)=>{
          var k="select photourl from user where id_user=?"
          connection.query(k,res.locals.id,(err,resulo)=>{
       
         var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
          connection.query(q,[[results[0].iduser,resulo[0].photourl,'Ur Job Annonce Refused Check Ur Email '],date.date],(err,respo)=>{
            if(err){
              console.log(err)
            }
            else{
  console.log('success')
            }
           
      })
    }
    )
     })
  
  res.status(200).json({message:'dismiss of  jobrequest '})
      }
      else{
        
  res.status(500).json({message:err})
  
  
      }
    })
  })
  router.get('/getannoncecandidats',auth.authentificatetoken, (req, res, next) => {
    var query =
      "select * from postcandidatannonce  ORDER BY dateposte DESC  "
    connection.query(query,(err, results) => {
      if (!err) {
        res.status(200).json(results);
      } else {
        res.status(500).json({ message: err });
      }
    });
  });
  router.get('/getannoncecandidats/:id',auth.authentificatetoken, (req, res, next) => {
    var id=req.params.id
    var query =
      "select * from postcandidatannonce where id_post=?  "
    connection.query(query,id,(err, results) => {
      if (!err) {
        res.status(200).json(results);
      } else {
        res.status(500).json({ message: err });
      }
    });
  });
 
  router.get('/viewprofilbadge/:id',(req,res)=>{
    var id=req.params.id
       var query="select username,email,photourl,titreprofessionelle,pdfcv,location,aproposdemoi,university,diplomes ,detailleexperience,langues,datedenaissance,skills,linkedin,numerodetelephone,certificats,badge from user where usertype='candidat'and id_user=?   "
       connection.query(query,id,(err,result)=>{
           if(!err){
               res.status(200).json(result)
           }
           else{
               res.status(500).json(err);
           }
       })
   
   })
router.delete('/deletecandidatannonce/:id',auth.authentificatetoken, (req, res, next) => {
  var id=req.params.id ;
  var query = "delete from postcandidatannonce where id_post=?"
  connection.query(query,[id],(err, results) => {
    if (!err) {
      res.status(200).json({message:'Candidat Annonce deleted'});
    } else {
      res.status(500).json({ message: err });
    }
  })
});
router.get('/getusers',auth.authentificatetoken,(err,res)=>{
  var query="select id_user,username,email,badge,registerdate from user where usertype='candidat' ORDER BY registerdate DESC"
 
  connection.query(query,(err,result)=>{
    if(err){
      res.status(500).json(err)
    }
    else{
      res.status(200).json(result)
    }
  })
  
})
router.patch('/badgeapproved/:id',auth.authentificatetoken,(req,res,next)=>{
  var id=req.params.id
  var query=" update  user  set  badge='Approved' where id_user=? "
  connection.query(query,[id],(err,resul)=>{
    if(!err){
      
      var k="select photourl from user where id_user=?"
      connection.query(k,[res.locals.id],(err,resulo)=>{
   
     var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
      connection.query(q,[[req.params.id,resulo[0].photourl,'Ur Profil Is Approved U Can Postulate To Jobs and U Can Post A Search Job Annonce ']],(err,respo)=>{
        if(err){
          console.log(err)
        }
        else{
console.log('success')
        }
      })
      })
      res.status(200).json({message:'Profile Approved Successfully'})
    }
    
    
    else{
     
      res.status(500).json({message:err})
  }

})
})
router.patch('/badgeexpert/:id',auth.authentificatetoken,(req,res,next)=>{
  var id=req.params.id
  var query=" update  user  set  badge='Expert' where id_user=? "
  connection.query(query,[id],(err,resul)=>{
    if(!err){
      var k="select photourl from user where id_user=?"
      connection.query(k,[res.locals.id],(err,resulo)=>{
   
     var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
      connection.query(q,[[req.params.id,resulo[0].photourl,'Ur Profil Is Upgraded To Expert']],(err,respo)=>{
        if(err){
          console.log(err)
        }
        else{
console.log('success')
        }
      })
      })
      res.status(200).json({message:'Profile Upgraded Successfully To Expert'})
    }
    
    
    else{
     
      res.status(500).json({message:err})
  }

})
})

router.get('/rankingjobs',auth.authentificatetoken,(err,res)=>{
  var id=res.locals.id
  var query ="select logourl,companyname,jobtitle,dateposte from job where user.titreprofessionelle=job.jobtitle and user.id_user=?"
  connection.query(query,[id],(err,res)=>{
    if(err){
      res.status(500).json(err)
    }
    else{

  var q="insert into notifications (id_notification,photourl,message,date) values(?,?)"
                   connection.query(q,[[id,results[0].logourl,results[0].companyname+'  '+results[0].jobtitle+' :'+'Here An Annonce That Is Gathered For Ur Profil '],results[0].dateposte],(err,respo)=>{
                     if(err){
                       console.log(err)
                     }
                     else{
           console.log('success')
                     }

                    }

)}})})





module.exports=router
