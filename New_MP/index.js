const express = require('express');
const path = require('path');
const data = require('./data/connect');
const app = express();

app.use(express.static(path.join(__dirname, "public")))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"))

app.get('/', (req, res)=>{
    res.render('index');
})

app.get('/about_page', (req, res)=>{
    res.render('about_page');
})

app.get('/common',async (req, res)=>{
    const dataFromDB = await data.find();
    res.render('common',{data: dataFromDB});
})

app.get('/education', (req, res)=>{
    res.render('education');
})

app.get('/farmer', (req, res)=>{
    res.render('farmer');
})

app.get('/RTO', (req, res)=>{
    res.render('RTO');
})

app.listen(3000);