const express = require('express');
const path = require('path');
const data = require('./data/connect');
const userModel = require('./data/user');
const adminModel = require('./data/admin');
const serviceModel = require('./data/service');
const imageModel = require('./data/image');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const upload_new = require('./utils/multer-config');
const fs = require('fs');
const session = require('express-session');
let isUSerLoggedIn = 0;


app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, "views"),
    path.join(__dirname, "views/common"),
    path.join(__dirname, "views/task"),
    path.join(__dirname, "views/education"),

]);

app.use(session({
  secret: 'secret', // change this in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', (req, res)=>{
    res.render('form');
})


app.get('/home',isLoggedIn, (req, res)=>{
    res.render('index' , { loggedIn: req.session.loggedIn });
})

app.post('/search',async (req,res)=>{
    let value = req.body.search;

    const doc = await imageModel.findOne({document : value});
    value = value.trim().toLowerCase().split(" ").join("")
    res.render(value,{data:doc});

})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.redirect('/home');
      }
      res.clearCookie('connect.sid'); // clear session cookie
      res.redirect('/home');
    });
  });

app.get('/admin',isLoggedIn, (req, res)=>{
    res.render('admin');
})

app.get('/login',(req,res)=>{
    res.render('form');
})

app.get('/admin/:task',isLoggedIn,async (req, res)=>{
    const serviceDB = await serviceModel.find({authority:"admin"});
    res.render(`${req.params.task}`, {data: serviceDB,flag:false,service_name:null});
})

app.get('/admin/add/:doc',isLoggedIn,async (req, res)=>{
    let service_name = req.params.doc;
    let database = await imageModel.find({service_name});
    res.render("doc",{title:service_name, data:database});
})

app.get('/admin/delete/:doc',isLoggedIn,async (req, res)=>{
    try {
        let service_name = req.params.doc
        const data = await imageModel.find({service_name});

        res.render("delete_doc", {data})
        } catch (error) {
        res.send("");
    }
})



app.get('/about_page', (req, res)=>{
    res.render('about_page');
})

app.get('/common',async (req, res)=>{
    let service = "Common Services";
    const dataFromDB = await imageModel.find({service_name:service});
    res.render('common',{data: dataFromDB});
})

app.get('/student',async (req, res)=>{
    let service = "Education"
    const dataFromDB = await imageModel.find({service_name:service});
    res.render('education', {data: dataFromDB});
})

app.get('/farmer',async (req, res)=>{
    let service = "Farmer"
    const dataFromDB = await imageModel.find({service_name:service});
    res.render('farmer', {data: dataFromDB});
})

app.get('/RTO',async (req, res)=>{
    let service = "RTO"
    const dataFromDB = await imageModel.find({service_name:service});
    res.render('RTO', {data: dataFromDB});
})

app.get('/common/:service',async (req, res)=>{
    let service = req.params.service;
    let doc = req.params.service;
    service = service.trim().toLowerCase().split(" ").join("");
    const dataFromDB = await imageModel.findOne({document:doc});
    // console.log(service);
    res.render(service,{data:dataFromDB});
})

app.post('/upload',isLoggedIn, upload_new.single('image'),async (req, res)=>{
    let { name, heading, info1, info2, info3, info4, service_name  } = req.body;
    let imgBuffer = req.file ? req.file.filename : null;
    // console.log(req.file);

    try {
        // Create a new document in the database with base64 image
        let base = await imageModel.create({
            service_name,
            document : name,
            heading,
            info1,
            info2,
            info3,
            info4,
            image_data: imgBuffer // Store base64 string of the image
        });
        
        // Redirect to another page after successful upload
        res.redirect('/admin/add');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error uploading file");
    }

})

app.post('/signup',async (req, res)=>{
    let {username, email, password, age, gender, profession} = req.body;

    let recommend = [];

    let user = await userModel.findOne({email});
    if(user){
        res.status(500).send("User already registered");
    } 

    if(age < 18){
        if(profession == 'student' || gender == 'male'){
            recommend.push('Aadhar Card', 'Ration Card');
        }
    }

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt,async (err, hash)=>{
            let user = await userModel.create({
                username,
                email,
                password: hash,
                gender,
                age,
                profession,
            });
            let token = jwt.sign({email, userid: user._id}, "secret");
            res.cookie("token", token,{recommend: recommend});
            res.redirect("/#");
        })
    })
})

app.post("/login",async (req, res) =>{
    let {email, password} = req.body;

    let flag = "";
    let admin = await adminModel.findOne({email});
    if(admin){
        flag="admin";
        checkUser(res, admin, {email, password},flag);

    }
    else{
        let user = await userModel.findOne({email});
        if(!user) return res.status(500).send("Something Went Wrong");
        flag = "home";
        req.session.loggedIn = true;
        req.session.username = email;
        checkUser(res, user, {email, password}, flag);
    }
})

function checkUser(res, user, {email, password}, flag){
    let userEmail = email;
    let userFlag = flag;
    bcrypt.compare(password, user.password, function(err, result){

        if(result){
            let token = jwt.sign({userEmail, userid: user._id}, "secret");
            res.cookie("token", token);
            isUSerLoggedIn = 1;
            console.log(isUSerLoggedIn);
            res.redirect(`/${userFlag}`);
        }
        else res.redirect("/#");
    })
}

app.post('/admin/add',isLoggedIn,async (req, res)=>{
    let {newService} = req.body;
    let services = await serviceModel.findOne({authority: "admin"});
    services.service.push(newService);
    await services.save();
    res.redirect("/admin/add");
})

app.post('/deletedoc',isLoggedIn,async (req, res) =>{
    let documentName = req.body.doc;
    try{
        let indi_document = await imageModel.findOne({document: documentName});
        fs.unlink(`public/images/${indi_document.image_data}`,(err)=>{
            console.log(err)
        });
        await imageModel.deleteOne({document: documentName})
        res.json({success: true});
    } catch(err){
        res.json({success: false});
    }
})

app.post('/deleteser',isLoggedIn,async (req, res) =>{
    let documentName = req.body.doc;

    try{
        let indi_document = await imageModel.find({service_name: documentName});
        if(indi_document.length != 0){
            for(doc in indi_document){
                fs.unlink(`public/images/${indi_document[doc].image_data}`,(err)=>{
                    console.log(err)
                });
            }
            await imageModel.deleteMany({service_name: documentName})
        }

        let services = await serviceModel.findOne({authority: "admin"});
        let index = services.service.indexOf(documentName);
        if(index > -1){
            services.service.splice(index, 1);
        }
        await services.save();
        res.json({success: true});
    } catch(err){
        res.json({success: false});
    }
})

function isLoggedIn(req, res, next){
    // let login = document.getElementById("login");
    // login.innerHTML = "Logout";
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
        next();
    }
}



app.listen(3000);