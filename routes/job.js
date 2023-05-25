const express = require("express");
const router = express.Router();
const connection = require("../connection");
var auth = require("../Services/authentification");
var verifrole = require("../Services/verifrole");
var app = require("../index");

router.post("/add",auth.authentificatetoken, (req, res,next) => {
  var job = req.body;
const id =res.locals.id
var  email =res.locals.email
var k="select username,location,companyurl,photourl from user where id_user=?"
connection.query(k,[id],(err,resylll)=>{
 
  var query =
    "INSERT INTO job (iduser,jobtitle,companyname,gouvernement,jobtype,jobcategorie,Descriptionj,salary,companyurl,closingdate,logourl,dateposte,hours,jobrequirement,companyemail,nombrepostes,phone) Values (?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?)"
  connection.query(
    query,
    [[id],
      job.jobtitle,
      resylll[0].username,
      resylll[0].location,
      job.jobtype,
      job.jobcategorie,
      job.Descriptionj,
      job.salary,
      resylll[0].companyurl,
      job.closingdate,
      resylll[0].photourl,
     
      job.hours,
      job.jobrequirement,
      [email],
      job.nombrepostes,
      resylll[0].numerodetelephone
  
    ],
    (err,result) => {
      if (!err) {
     
   
        res
          .status(200)
          .json({ message: "Sended Successfully  Waiting For Admin Approval" });
      } else {
   
        res.status(500).json({ message: err });
      }
    }
  )
});
});
router.post("/comment/:id", auth.authentificatetoken, (req, res) => {
  var comment = req.body;
  var id = res.locals.id;
  var jobid = req.params.id;
  var query = "select * from comment where jobid=? and id_comment=?";

  connection.query(query, [jobid, id], (err, results) => {
    if (!err) {
      if (results.length <=0) {
        connection.query(
          "insert into comment(id_comment,commentaire,jobid) values (?,?,?) ",
          [id, comment.commentaire, jobid],
          (err, result) => {
            if (!err) {


              return res
                .status(200)
                .json({ message: "comment posted succesfully" });
            } else {
              return res.status(400).json({message:'probleme sourvenue'});
            }
          }
        );
      } else {
        return res
          .status(500)
          .json({ message: "you have already posted your comment" });
      }
    } else {
      return res.status(500).json({message:'probleme'});
    }
  });
});

router.get("/comme/:id", (req, res) => {
  var jobid=req.params.id

  var query = "select  commentaire ,username,photourl from comment,user where user.id_user=comment.id_comment and jobid=?"
  connection.query(query, [jobid],(err, result) => {

    if (!err) {
    return res.status(200).json(result)
    }
    else return res.status(401).json(err);
  });
});
router.get("/getjobs",auth.authentificatetoken, (req, res, next) => {
  const job = req.body;
  var query =
    "select jobtitle,companyname,gouvernement,jobtype,jobcategorie,Descriptionj,salary,companyurl,closingdate,nombrepostes,companyemail,phone from job where (jobtitle=? && gouvernement=?) ORDER BY dateposte DESC ";
  connection.query(query, [job.jobtitle, job.gouvernement], (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});
router.get("/jobid", (req, res, next) => {
  var query = "select jobid from Job ";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.get("/getjobss",auth.authentificatetoken, (req, res, next) => {
  var query =
    "select jobid,jobtitle,dateposte,phone,companyemail,nombrepostes,companyname,gouvernement,jobtype,jobcategorie,Descriptionj,salary,companyurl,closingdate ,logourl,status from Job ORDER BY dateposte DESC ";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});
router.get("/getjobbyid/:id",auth.authentificatetoken, (req, res, next) => {
  var jobid = req.params.id;
  var query =
    "select jobtitle,nombrepostes,companyname,gouvernement,jobtype,jobcategorie,Descriptionj,salary,companyurl,logourl,closingdate,companyemail,dateposte,hours ,jobrequirement,phone from Job  where jobid=?";
  connection.query(query, [jobid], (err, results) => {
    if (!err) {
      res.status(200).json(results[0]);
    } else {
      res.status(500).json({ message: err });
    }
  });
});

router.patch("/update", auth.authentificatetoken, (req, res, next) => {
  let job = req.body;
  var query =
    "update Job set jobtitle=?,companyname=?,gouvernement=?,jobtype=?,jobcategorie=?,Description=?,salary=?,companyurl=? where jobid=?";
  connection.query(
    query,
    [
      job.jobtitle,
      job.companyname,
      job.gouvernement,
      job.jobtype,
      job.jobcategorie,
      job.Description,
      job.salary,
      job.companyurl,
      job.closingdate,
      job.logourl,
      job.jobid,
    ],
    (err, res) => {
      if (!err) {
        if (res.affectedrows == 0) {
          res
            .status(404)
            .json({ message: "job not found please contact admin" });
        }
        return res.status.json({ message: "job added successfully" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});
router.delete("/delete/:id", auth.authentificatetoken, (req, res, next) => {
  var jobid = req.params.id;
  var query = "delete from job where jobid=?";
  connection.query(query, [jobid], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "job id not found" });
      }
      return res.status(200).json({ message: "job deleted succesfully" });
    } else {
      return res.status(500).json(err);
    }
  });
});
router.patch(
  "/upjobstatus/:id",
  auth.authentificatetoken,
  verifrole.verifrole,
  (req, res, next) => {
    var job = req.params.id;
    var query = "update Job set status='false' where jobid=?";
    connection.query(query, [job], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0)
          res.status(404).json({ message: "job id not found" });
        else return res.status(200).json({ message: "job posted" });
      } else return res.status(500).json({ message: err });
    });
  }
);
router.post('/postrecruteur',(req,res)=>{
  var jobid=req.params.id
  var id=res.locals.id
  var query="insert into recrutement (jobid,postuleurid)values(?,?)"
  connection.query(query,[jobid,id],(err,result)=>{
      if(!err){
          res.status(200).json({message:'Awaiting Receiver Confirmation Good Luck'})
      }
      else{
          res.status(500).json(err);
      }
  })
})




module.exports = router;
