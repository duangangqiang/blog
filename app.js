var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/routes');
var settings = require("./settings");
var flash = require("connect-flash");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
// 文件上传插件
var multer = require('multer');
var app = express();

//session保存在称为sessionStore的数据仓库中。
//默认使用MemoryStore，就是所有session信息都保存在内存中。
//每来一个请求后，在路由分发前，首先使用cookieParser中间件将cookie中
//的sessionID解析出来，然后根据sessionID去sessionStore中进行查找，
//如果找到一份session后，就使用sessionStore中的数据构建一个新的session对象，
//把这个session对象放到req.session中，这就是session的由来。
app.use(session({
  resave:false,//添加这行  
  saveUninitialized: true,//添加这行  
  secret:settings.cookieSecret,
  key: settings.db, //cookie.name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, //30 days
  store: new MongoStore({
    url: 'mongodb://localhost/blog'
  })
}));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage });
var cpUpload = upload.any();
app.use(cpUpload);

// view engine setup
//__dirname(全局变量)是当前脚本所在的路径
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//日志文件中间件
app.use(logger('dev'));

//flash是session中用于存储信息的特定区域
app.use(flash());

//解析JSON的中间件
app.use(bodyParser.json());

//加载urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));

//加载解释cookie的中间件
app.use(cookieParser());

//设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

//路由控制器
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// 开发环境下的错误处理器,将错误信息渲染error模板并显示到浏览器中
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//到处APP实例以供其他模块调用
module.exports = app;
