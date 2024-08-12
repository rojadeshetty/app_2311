const express=require ("express");
const cors=require("cors");
const mongoose=require("mongoose");
const multer=require("multer");
const jwt=require("jsonwebtoken");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      console.log(file);
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
  
  const upload = multer({ storage: storage })

let app=express();
app.use(cors());
app.use('/uploads', express.static('uploads'))

app.listen(4561,()=>{
    console.log("listening to the port 4561");
});

let UserSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    password:String,
    mobileno:Number,
    profilepic:String,
});

let User=new mongoose.model("user",UserSchema);

app.post("/Signup",upload.single("profilepic"),async(req,res)=>{
    console.log(req.body);
    console.log(req.file);
    try{
    let newUser=new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password,
        mobileno:req.body.mobileno,
        profilepic:req.file.path,
    });
    console.log(newUser);
    await User.insertMany(newUser);
    res.json({status:"Success",msg:"Successfully inserted data into database"});
    }catch(err){
        res.json({status:"Failed", msg:"Unable to insert the data into database",err:err});
    }
});

app.post("/Login",upload.none(),async(req,res)=>{
    console.log(req.body);
let userData=await User.find().and({email:req.body.email});
console.log(userData);
if(userData.length>0){
   if(userData[0].password==req.body.password){
    let token=jwt.sign({email:req.body.email,password:req.body.password},"bazooka");
    userDataToSend={
        firstName:userData[0].firstName,
        lastName:userData[0].lastName,
        email:userData[0].email,
        mobileno:userData[0].mobileno,
        profilepic:userData[0].profilepic,
        token:token,
    };
     res.json({status:"Success",data:userDataToSend});
   }else{
    res.json({status:"Failed",msg:"Invalid Password"});
   }
}else{
   res.json({status:"Failed",msg:"User does not exists"});
}
});

app.post("/LoginWithToken",upload.none(),async(req,res)=>{
    console.log(req.body);
    let decryptedToken=jwt.verify(req.body.token,"bazooka");
    console.log(decryptedToken);
    let userData=await User.find().and({email:decryptedToken.email});
    if(userData.length>0){
       if(userData[0].password==decryptedToken.password){
        let userDataToSend={
            firstName:userData[0].firstName,
            lastName:userData[0].lastName,
            email:userData[0].email,
            mobileno:userData[0].mobileno,
            profilepic:userData[0].profilepic,
        }
        res.json({status:"Success",data:userDataToSend});
       }else{
        res.json({status:"Failed",msg:"Invalid Token"});
       }
    }else{
        res.json({status:"Failed",msg:"Invalid Token"});
    }
});

let connectToDb=async()=>{
    try{
        await mongoose.connect("mongodb+srv://rojadeshetty:rojadeshetty@cluster0.cg1gqc8.mongodb.net/MernPractice?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Successfully connected to database");
    }catch(err){
        console.log(err);
        console.log("Unable to connect to database");
    }
};

connectToDb();