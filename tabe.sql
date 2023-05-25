create table Job (
    jobid int PRIMARY KEY NOT NULL AUTO_INCREMENT,
     jobtitle varchar(30),
     companyname varchar(30),
     gouvernement varchar(10),
     jobtype varchar(10),
     jobcategorie varchar(40),
     Descriptionj varchar(200),
     salary varchar(30),
     companyurl varchar(250) ,
     closingdate date ,
     logourl varchar(250)
);