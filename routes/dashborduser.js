const express = require("express");
const router = express.Router();
const connection = require("../connection");
var app = require("../index");
var auth = require("../Services/authentification");
var verifrole = require("../Services/verifrole");
const res = require("express/lib/response");
router.get(
  "/usercounts",
  auth.authentificatetoken,

  (req, res, next) => {
    var usercount;
    var jobcount;
    var query = "select count(id) as usercount from user ";
    connection.query(query, (err, results) => {
      if (!err) {
        usercount = results[0].usercount;
      } else {
        res.status(500).json({ message: err });
      }
      var query = "select count(jobid)  as jobcount from job";
      connection.query(query, (err, results) => {
        if (!err) {
          jobcount = results[0].jobcount;
        } else {
          res.status(500).json({ message: err });
        }
        var data = {
          usercount: usercount,
          jobcount: jobcount,
        };
        res.status(200).json(data);
      });
    });
  }
);

router.post('/postannonce',auth.authentificatetoken,(req,res,next)=>{
 
  var an=req.body
  const id =res.locals.id
  const email=res.locals.email
  var k="select username,location,numerodetelephone,photourl,pdfcv from user where id_user=?"
  connection.query(k,[id],(err,resylll)=>{
   
 var query="insert into postcandidatannonce(id_post,username,dateposte,description,expiredate,photourl,email,recherchedpost,pdfcv,location,hours,salary,phone) values(?,?,NOW(),?,?,?,?,?,?,?,?,?,?)"
 
 connection.query(query,[[id],resylll[0].username,an.description,an.expiredate,resylll[0].photourl,email,an.recherchedpost,resylll[0].pdfcv,resylll[0].location,an.hours,an.salary,resylll[0].numerodetelephone],(err,result)=>{

   if(err){
    
    res.status(500).json({message:'You  Already Posted An Annonce'})
 
   }
   else{  
  

     res.status(200).json({message:'annonce posted succesfully'})

   }
 })
})
})


router.post("/postulatetojob/:id", auth.authentificatetoken, (req, res) => {

  var id = res.locals.id;
  var jobid = req.params.id;
  var query = "select * from  recrutement where jobid=? and idpostuleur=?";

  connection.query(query, [jobid, id], (err, results) => {
    if (!err) {
      if (results.length <=0) {
        connection.query(
        "insert into recrutement (jobid,idpostuleur) values(?,?)",
          [jobid, id],
          (err, result) => {  
            if (!err) {
              return res
                .status(200)
                .json({ message: " Successfully Postulated " });
            } else {
              return res.status(405).json({message:' Already Postulated To This Job'});
            }
          }
        );
      } else {
        return res
          .status(405)
          .json({ message: ' Already Postulated To This Job' });
      }
    } else {
      return res.status(405).json({message:' Already Postulated To This Job'});
    }
  });
});
router.get('/getpostulatedemandes',auth.authentificatetoken, (req, res,next) => {
    var id=res.locals.id
    var query="select companyname,jobtitle,dateposte,closingdate,recrutement.status from job,recrutement where  recrutement.idpostuleur=? and job.jobid=recrutement.jobid   "
    connection.query(query,[id],(err,results)=>{
        if(!err){
        
            res.status(200).json(results)
        }
        else{
            res.status(500).json({message:err})
        }
    })

});


router.post('/pdf',(req,res)=>{
  var pdf=req.files.pdf
  var fich="http://localhost:3000/pdf/"+pdf.name

 
  var query="insert into postcandidatannonce(id_post,cv) values(362,?)"
 
  connection.query(query,[fich],(err,res)=>{
    pdf.mv('./public/pdf/'+pdf.name)
    if(!err){ 

      console.log('happy')
    }
    else{
    console.log('angry')
 
    }
  })
})




module.exports = router;
