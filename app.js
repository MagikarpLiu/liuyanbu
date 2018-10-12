var express = require('express');
var articleModel = require("./models/article")
var flash = require('connect-flash')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express();
//开放静态文件夹 public
app.use(express.static('public'));

//cookie
app.use(session({
    cookie: {
        path: '/', 
        httpOnly: true, 
        secure: false, 
        maxAge: 60 * 1000
    },
    secret: 'test',
    resave: false,
    saveUninitialized: false
}))


//set view engine to ejs
app.set('view engine','ejs');
app.set('views', __dirname + '/views');

//add bodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// add flush
app.use(flash());
//中间件要使用next()
app.use((req, res, next) => {
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
})

app.get('/', (req, res) => {
    articleModel.find({}).sort({_id: -1}).exec((err, articles) => {
        if(err) return next(err)
        res.render('index', {
            articles: articles
        })
    })
})

app.get('/test', (req, res)=> {
    res.render('test');
})

app.get("/create", (req, res) => {
    res.render('create');
})

app.post('/article', (req, res) => {
    let title = req.body.title;
    let content = req.body.content;

    //错误检查（按说应该放在页面上进行检查呀）
    try {
        if (!title.length) {
          req.flash('error', '请填写标题')
          return res.redirect('back')
        }
        if (!content.length) {
          req.flash('error', '请填写内容')
          return res.redirect('back')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    let articleData= {
        title: title,
        content: content
    }

    articleModel.create(articleData, (err, article) => {
        if (err) {
            return next(err);
        }
        else {
            req.flash('success', "留言成功")
            res.redirect('/')
        }
    })
})

app.get('/remove_article/:articleID', (req, res) => {
    const articleID = req.params.articleID
    articleModel.deleteOne({ _id: articleID }).exec((err) =>{
        if(err) next(arr);
        req.flash('success', '删除成功')
        res.redirect("back")
    })
})

app.listen(80)