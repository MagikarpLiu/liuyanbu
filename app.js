//require 库文件
const express = require('express');
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const session = require('express-session')
//use mongoStore to automatcially store the session to the db
const MongoStore = require('connect-mongo')(session);
const mongoose = require('./models/mongoose')

//database model
const articleModel = require("./models/article")

//文件上传组件
const multer  = require('multer')
var upload = multer({ dest: './public/avatars/'}) //上传处理中间件 会把文件挂载在req.file或files中
const path = require('path')
const fs = require('fs')

//routers
const userRouter = require('./routes/user_router')
const articleRouter  = require('./routes/article_router')


//app init
var app = express();

//开放静态文件夹 public
app.use(express.static('public'));

//cookie
app.use(session({
    cookie: {
        path: '/', 
        httpOnly: true, 
        secure: false, 
        //10 * 60 * 1000ms = 10min
        maxAge: 10 * 60 * 1000
    },
    secret: 'test',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))


//set view engine to ejs
app.set('view engine','ejs');
app.set('views', __dirname + '/views');

//add bodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// add flush
app.use(flash());
//中间件要使用next()来把控制权交给后续路由
//res.locals 内部存储的变量可以直接被 view engine 在渲染时使用
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
})

//添加路由
app.use('/user', userRouter);
app.use('/article', articleRouter);

app.get('/', (req, res) => {
    articleModel.find({}).sort({_id: -1}).exec((err, articles) => {
        if(err) return next(err)
        res.locals.articles = articles
        res.render('index');
    })
})

app.get('/test', (req, res)=> {
    res.render('test');
})

app.post('/test', upload.single('avatar'), (req, res) => {
    let email = req.body.email
    let username = req.body.username
    let password = req.body.password
    let avatar = req.file
    try{
        if(!email.length) {
            throw new Error('邮箱不能为空')
        }
        if(!username.length) {
            throw new Error('名字不能为空')
        }
        if(!password.length) {
            throw new Error('密码不能为空')
        }
        if(!avatar) {
            throw new Error('头像不能为空')
        }
    } catch(err) {
        //如果注册失败 删除上传的头像
        if(avatar) {
            console.log("[FS]: 删除头像")
            fs.unlink(avatar.path)
        }
        req.flash('error', err.message);
        return res.redirect('back')
    }
})

app.post('/test', (req, res) => {
    console.log(req.body)
    res.send("ok")
})


//监听80端口的请求
app.listen(80)