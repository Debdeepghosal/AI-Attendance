const express=require("express");
const app=express();
require('dotenv').config();
const bodyparser = require('body-parser') ;
const port=process.env.PORT || 3000;
const fs=require('fs');

app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json());
app.use(express.static("./public"));


app.post('/attendance',(req,res)=>{
  fs.readFile('attendance.txt','utf-8',(err,data)=>{
    if(err){
      console.error(err);
      return;
    }
    if (data.search(req.body.name)>=0) {
      return;
    }
    else{
      fs.appendFile('attendance.txt',req.body.name,err=>{
        if(err){
          console.error(err);
          return;
        }
      })
    }
  })

  
})
app.get("/attendance/sheet",(req,res)=>{
  res.sendFile(__dirname+"/attendance.txt");
})

app.listen(port,()=>{
  console.log("Listening on port ",port);
})
