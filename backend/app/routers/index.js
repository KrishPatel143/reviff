const http = require('http');
const express = require('express');
const serviceRoutes = require('./service/index');
const userRoutes = require('./users/index');
const orderRoutes = require('./orders/index');
const multerRoutes = require('./multer/index');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

class Router {
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.corsOptions = {
            origin: ['http://localhost:3000', 'http://localhost:4000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'verification', 'authorization'],
            exposedHeaders: ['Authorization', 'authorization'],
            credentials: true,
        };
    }

    async initialize() {
        this.setupMiddleware();
        this.setupServer();
    }

    setupMiddleware() {
        this.app.disable('etag');
        this.app.enable('trust proxy');

        // Updated helmet configuration to allow cross-origin resources
        this.app.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            crossOriginEmbedderPolicy: false
        }));
        
        this.app.use(cors(this.corsOptions));
        this.app.use(compression());
        this.app.use(bodyParser.json({ limit: '16mb' }));
        this.app.use(
            bodyParser.urlencoded({
                limit: '16mb',
                extended: true,
                parameterLimit: 50000,
            })
        );

        if (process.env.NODE_ENV !== 'prod')
            this.app.use(
                morgan('dev', {
                    skip: req => req.path === '/ping' || req.path === '/favicon.ico',
                })
            );

        this.app.use(this.routeConfig);
        
        // Add specific CORS headers for file serving
        this.app.use('/uploads', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Cross-Origin-Resource-Policy', 'cross-origin');
            next();
        });

        // Serve static files
        this.app.use(express.static('./seeds'));
        this.app.use('/uploads', express.static('./uploads')); // Add uploads directory

        this.app.use('', userRoutes);
        this.app.use('', serviceRoutes);
        this.app.use('/order', orderRoutes);
        this.app.use('', multerRoutes);

        this.app.use('*', this.routeHandler);
        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);
    }

    setupServer() {
        this.httpServer = http.Server(this.app);
        this.httpServer.timeout = 300000;
        this.httpServer.listen(process.env.PORT, '0.0.0.0', () => console.log(`Spinning on ${process.env.PORT}`));
    }

    routeConfig(req, res, next) {
        req.sRemoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (req.path === '/ping') return res.status(200).send({});
        res.reply = ({ code, message }, data = {}, header = undefined) => {
            res.status(code).header(header).json({ message, data });
        };
        next();
    }

    routeHandler(req, res) {
        res.status(404);
        res.send({ message: 'Route not found' });
    }

    logErrors(err, req, res, next) {
        console.error('body -> ', req.body);
        console.error(`${req.method} ${req.url}`);
        console.error(err.stack);
        return next(err);
    }

    errorHandler(err, req, res, next) {
        res.status(500);
        res.send({ message: err.message || err });
    }
}

module.exports = new Router();