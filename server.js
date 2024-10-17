// server.js
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport_congig'); // Make sure the path is correct
const flash = require('express-flash');
const session = require('express-session');

const users = []; // This should be replaced with a real database in a production environment

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

app.use(express.static('public')); // Serving static files from the 'public' directory

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/features', checkAuthenticated, (req, res) => {
    res.render('features');
});

app.get('/budget', (req, res) => {
    res.render('budget');
});

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', { name : req.user.name });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});

// Middleware functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}
// Add this to your server.js file
const axios = require('axios'); // Ensure axios is installed


// Define API credentials and URL
const API_URL = 'https://booking-com.p.rapidapi.com/v1/hotels/search';
const API_KEY = '0c93012921msh70112470c2418bcp1bcbd3jsncd8e2892f554';
const API_HOST = 'booking-com.p.rapidapi.com';

app.get('/api/hotels', async (req, res) => {
    const { destination, checkInDate, checkOutDate, minBudget, maxBudget } = req.query;

    try {
        // Construct the URL for hotel search
        const url = `${API_URL}?destination=${encodeURIComponent(destination)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&minBudget=${minBudget}&maxBudget=${maxBudget}`;

        // Make a request to the hotel API
        const response = await axios.get(url, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        // Extract and format the hotel data from the API response
        const hotels = response.data.result.map(hotel => ({
            name: hotel.name,
            price: hotel.price,
            link: hotel.url
        }));

        res.json({ hotels });
    } catch (error) {
        console.error('Error fetching hotel data:', error);
        res.status(500).json({ error: 'Failed to fetch hotel data. Please try again later.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
