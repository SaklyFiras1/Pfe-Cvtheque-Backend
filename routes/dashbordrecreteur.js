const express = require("express");
const router = express.Router();
const connection = require("../connection");
var auth = require("../Services/authentification");
var verifrole = require("../Services/verifrole");
var app = require("../index");


router.get('/getjobsbyid',auth.authentificatetoken, (req, res,next) => {
    var id=res.locals.id
    var query="select * from job where iduser=?"
    connection.query(query,[id],(err,results)=>{
        if(!err){
            res.status(200).json(results)
        }
        else{
            res.status(500).json({message:'Something Wrong Reconnect Or Contact Admin'})
        }
    })

});
router.get('/recreteur/:id',auth.authentificatetoken,(req,res)=>{
  var jobid=req.params.id
    var query="select id_user,username,pdfcv,email,photourl,titreprofessionelle,location,aproposdemoi,university,diplomes ,detailleexperience,langues,datedenaissance,skills,linkedin,numerodetelephone,certificats,recrutement.status from user ,recrutement where user.id_user=recrutement.idpostuleur and jobid=?  "
    connection.query(query,[jobid],(err,result)=>{
        if(!err){
            res.status(200).json(result)
        }
        else{
            res.status(500).json(err);
        }
    })
    
})

router.get('/checkcomcan',auth.authentificatetoken,(req,res)=>{

var id=res.locals.id
 var query="select usertype,badge from user where id_user=?"
 connection.query(query,[id],(err,result)=>{
     if(!err){
         res.status(200).json(result)
     }
     else{
         res.status(500).json(err)
     }
 })

})
router.get(
    "/postuleurcounts/:id",
  
 
    (req, res, next) => {
      var usercount;
      var jobid=req.params.id
    
      var query = "select count(idpostuleur) as usercount from recrutement where jobid=? ";
      connection.query(query,jobid, (err, results) => {
        if (!err) {
          usercount = results[0].usercount;
          res.status(200).json(usercount);
        } else {
          res.status(500).json({ message: err });
        }
      
          
        });
      });
     
router.get('/viewprofil/:id',(req,res)=>{
   var id=req.params.id
      var query="select username,email,photourl,titreprofessionelle,location,aproposdemoi,university,diplomes ,pdfcv,detailleexperience,langues,datedenaissance,skills,linkedin,numerodetelephone,certificats,badge from user where  id_user=?   "
      connection.query(query,id,(err,result)=>{
          if(!err){
              res.status(200).json(result)
          }
          else{
              res.status(500).json(err);
          }
      })
  
  })

  


router.delete('/deleteannonce/:id',auth.authentificatetoken,(req,res)=>{
    var jobid=req.params.id
    const id=res.locals.id
    var query="delete from job where  job.iduser=? and jobid=? "
    connection.query(query,[id,jobid],(err,result)=>{
        if(!err){
            
      
            res.status(200).json({message:'Your Job Annonce Successfully Deleted '})
                
            }
        
        else{
            res.status(500).json(err)

        }
      
      
 }) })
    
    router.delete('/deletecandidat/:id',auth.authentificatetoken,(req,res)=>{
        var jobid=req.params.id
        var iduser=req.params.id
        var query="delete from recrutement where  jobid=? and idpostuleur=?"
        connection.query(query,[jobid,iduser],(err,result)=>{
            if(!err){
                
               
               
                res.status(200).json({message:'Your Job Annonce Successfully Deleted '})
                    
                }
            
            else{
                res.status(500).json(err)
    
            }
          
    })})

    router.patch('/refusecandidat/:id/:candidat',auth.authentificatetoken,(req,res,next)=>{
       jobid=req.params.id
       idpostuleur=req.params.candidat
       date=req.body
       
  
       var query ="update recrutement set status='refused' where jobid=? and idpostuleur=?"
        connection.query(query,[jobid,idpostuleur],(err,result)=>{
          if(!err){
            
    
             connection.query(query,[jobid,idpostuleur],(err,respon)=>{
               if(!err){
                 var jo="select companyname,logourl from job where jobid=? "
                 connection.query(jo,[jobid],(err,results)=>{
                  var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
                   connection.query(q,[[idpostuleur,results[0].logourl,results[0].companyname+' '+'Rejected Your Application'],date.date],(err,respo)=>{
                     if(err){
                       console.log(err)
                     }
                     else{
           console.log('success')
                     }
                    
               })
              })
            
            
      
      res.status(200).json({message:' Candidat  Rejected'})
          }
          else{
            
      res.status(500).json({message:err})
       
      
          }
        })
      }
    })
  })
      router.patch('/preselectcandidat/:id/:candidat',auth.authentificatetoken,(req,res,next)=>{
        jobid=req.params.id
        idpostuleur=req.params.candidat
        var query ="update recrutement set status='preselected' where jobid=? and idpostuleur=?"
        connection.query(query,[jobid,idpostuleur],(err,result)=>{
          if(!err){
            var jo="select companyname,logourl from job where jobid=? "
            connection.query(jo,[jobid],(err,results)=>{
              console.log(results[0].logourl)
           
             var q="insert into notifications (id_notification,photourl,message,date) values(?,Now())"
              connection.query(q,[[idpostuleur,results[0].logourl,results[0].companyname+' '+'Preselected Your Application']],(err,respo)=>{
                if(err){
                  console.log(err)
                }
                else{
      console.log('success')
                }
               
          })
         })
      res.status(200).json({message:'Candidat Preselected'})
          }
          else{
            
      res.status(500).json({message:err})
      
      
          }
        })
      })
      router.get('/notifget',auth.authentificatetoken,(req,res)=>{
       id=res.locals.id
       var query="select * from notifications where id_notification=? ORDER BY date DESC"
       connection.query(query,[id],(err,result)=>{
         if(!err){
           res.status(200).json(result)
         }
         else{
           res.status(500).json(err)
         }
       })
      })
      router.get(
        "/notifcount",
        auth.authentificatetoken,
     
        (req, res, next) => {
          var notifcount;
    
        
          var query = "select count(id_notification) as notifcount from notifications where id_notification=?";
          connection.query(query,res.locals.id, (err, results) => {
            if (!err) {
              notifcount = results[0].notifcount;
            } else {
              res.status(500).json({ message: err });
            }
              res.status(200).json(notifcount);
              console.log(notifcount)
            });
          });
    
      

      
        
        


 


















module.exports=router