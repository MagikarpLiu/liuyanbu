//require 库文件
const express = require('express');
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const mongoose = require('./models/mongoose')

//database model
const articleModel = require("./models/article")

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
    res.locals.userName = req.session.userName;
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

app.post('/test', (req, res) => {
    console.log(req.body)
    res.send("ok")
})

//监听80端口的请求
app.listen(80)