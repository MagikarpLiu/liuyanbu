var express = require('express');
var articleModel = require("./models/article")
var bodyParser = require('body-parser')

var app = express();
//开放静态文件夹 public
app.use(express.static('public'));

//set view engine to ejs
app.set('view engine','ejs');
app.set('views', __dirname + '/views');

//add bodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
    articleModel.find({}).sort({_id: -1}).exec((err, articles) => {
        if(err) return next(err)
        res.render('index', {
            articles: articles
        })
    })
})

app.get("/create", (req, res) => {
    res.render('create');
})

app.post('/article', (req, res, next) => {
    let title = req.body.title;
    let content = req.body.content;

    //错误检查（按说应该放在页面上进行检查呀）
    try {
        if (!title.length) {
          throw new Error('请填写标题')
        }
        if (!content.length) {
          throw new Error('请填写内容')
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
            console.log(article)
            res.redirect('/')
        }
    })
})

app.get('/remove_article/:articleID', (req, res, next) => {
    const articleID = req.params.articleID
    articleModel.deleteOne({ _id: articleID }).exec((err, article) =>{
        if(err) next(arr);
        console.log("成功删除" + article._id);
        res.redirect("back")
    })
})

app.listen(80)