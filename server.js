require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./database');

const app = express();

// Trust proxy when behind reverse proxy (e.g., nginx)
if (process.env.TRUST_PROXY === 'true') {
	app.set('trust proxy', 1);
}

// Security headers
app.use(helmet({
	crossOriginResourcePolicy: { policy: 'same-origin' },
	contentSecurityPolicy: {
		useDefaults: true,
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			scriptSrcAttr: ["'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", 'data:'],
			connectSrc: ["'self'"],
			frameAncestors: ["'none'"],
			upgradeInsecureRequests: []
		}
	}
}));

// Disallow indexing by bots via HTTP header
app.use((req, res, next) => {
	res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache');
	next();
});

// JSON parser with limit
app.use(express.json({ limit: '64kb' }));

// Compression
app.use(compression());

// Basic rate limiting
const apiLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 60,
	standardHeaders: true,
	legacyHeaders: false
});
app.use(['/create-note', '/delete-note', '/note'], apiLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
	maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
	etag: true,
	setHeaders: (res, filePath) => {
		if (filePath.endsWith('index.html')) {
			res.setHeader('Cache-Control', 'no-store');
		}
	}
}));

// Routes
const createRoute = require('./routes/create');
const viewRoute = require('./routes/view');
const deleteRoute = require('./routes/delete');
app.use(createRoute);
app.use(viewRoute);
app.use(deleteRoute);

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Fallback to index.html for root
app.get('/', (_req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;

initializeDatabase()
	.then(() => {
		app.listen(port, () => {
			console.log(`OTN server listening on port ${port}`);
		});
	})
	.catch((err) => {
		console.error('Database initialization failed:', err);
		process.exit(1);
	});
