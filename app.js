const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const { create } = require('express-handlebars');
const session = require('express-session');
const methodOverride = require('method-override')
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const swaggerDocs = require('./config/swagger').swaggerDocs;
const swaggerUi = require('./config/swagger').swaggerUi;
const helpers = require('./utils/helpers'); // <--- Línea agregada

const hbs = create({ extname: 'hbs', 
defaultLayout: 'main', 
partialsDir: 'views/partials', 
helpers: helpers,
handlebars: require('handlebars').create({ allowProtoPropertiesByDefault: true }) });//modificado para incluir fichas
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'Session',
    }),
    secret: process.env.SESSION_SECRET || 'SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// view engine setup
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');
require('./config/cloudinary');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', indexRouter);
app.use('/users', usersRouter); //modificado para incluir las fichas

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
