var express = require('express');
var router = express.Router();
var userModel = require('../models/user');

router.use('/', function(req, res, next) {
    console.log('Request URL:', req.originalUrl);
    next();
}, function (req, res, next) {
    console.log('Request Type:', req.method);
    next();
}
);

router.get('/create', (req,res) => {
    res.render('createUser')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', (req, res)=> {
    let user = {
        email: req.body.email,
        password: req.body.password
    }

    userModel.findOne(user, (err, userFounded) => {
        if(err) {
            req.flash('error', err);
            res.redirect('back')
        } else if(userFounded) {
            req.session.user = userFounded._id
            req.session.userName = userFounded.username
            req.flash('success', "登陆成功")
            res.redirect('/')
        } else {
            req.flash('error', "账号或者密码错误");
            res.redirect('back')
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.user = null
    req.session.userName = null
    req.flash("success", "登出成功")
    res.redirect('/')
})

router.post('/create', (req, res) => {
    let email = req.body.email
    let username = req.body.username
    let password = req.body.password
    try{
        if(!email.length) {
            req.flash('error', "email不能为空")
            return res.redirect('back')
        }
        if(!username.length) {
            req.flash('error', "username不能为空")
            return res.redirect('back')
        }
        if(!password.length) {
            req.flash('error', "password不能为空")
            return res.redirect('back')
        }
    } catch(err) {
        console.log(err)
        req.flash('error', err);
        return res.redirect('back')
    }

    let newUser = {
        email:email,
        username: username,
        password: password
    }


    userModel.create(newUser, (err, user) => {
        if(err) {
            req.flash('error', "邮箱或用户名已存在")
            return res.redirect('back')
        } else {
            console.log(user);
            req.session.user = user._id
            req.session.userName = user.username
            req.flash('sucess', "创建成功")
            res.redirect('/')
        }
    })
});

module.exports = router;