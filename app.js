// Dependencias
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const { create } = require('express-handlebars');
const session = require('express-session');
const methodOverride = require('method-override');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// Swagger docs
const swaggerDocs = require('./config/swagger').swaggerDocs;
const swaggerUi = require('./config/swagger').swaggerUi;

// Helpers de Handlebars
const helpers = require('./utils/helpers');

// Cargar configuración de entorno
require('dotenv').config();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Rutas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Crear una instancia de Express
const app = express();

// Configuración de Handlebars
const hbs = create({
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: helpers,
  handlebars: require('handlebars').create({ allowProtoPropertiesByDefault: true }),
});

// Configuración de la sesión
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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    },
  })
);

// Configuración de Handlebars como motor de plantillas
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(logger('dev')); // Registra las solicitudes
app.use(express.json()); // Para parsear solicitudes JSON
app.use(express.urlencoded({ extended: false })); // Para parsear datos de formularios
app.use(cookieParser()); // Para trabajar con cookies
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos
app.use(flash()); // Mensajes flash
app.use(methodOverride('_method')); // Soporte para métodos HTTP como PUT y DELETE
app.use(passport.initialize()); // Inicializa Passport para la autenticación
app.use(passport.session()); // Manejo de sesiones con Passport

// Inicialización de Passport y otras configuraciones
require('./config/passport');
require('./config/cloudinary');

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Manejo de errores 404 (ruta no encontrada)
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Establece las variables locales para mostrar el mensaje de error
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Asegúrate de devolver solo una respuesta
  if (!res.headersSent) {
    res.status(err.status || 500);
    res.render('error');
  } else {
    // Si ya se ha enviado una respuesta, no intentes enviar otra
    next(err);
  }
});

// Exporta la aplicación para usarla en otros archivos
module.exports = app;
