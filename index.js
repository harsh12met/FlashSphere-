import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

const app = express();
const port = 3000;
const API_KEY = "0e08ed9f1ddb4ca7808c5245f3e65474";

// Middleware setup
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

// Set view engine
app.set('view engine', 'ejs');

// Countries data
const countries = {
    us: {
        name: "United States",
        states: ["New York", "California", "Texas", "Florida"]
    },
    gb: {
        name: "United Kingdom",
        states: ["England", "Scotland", "Wales", "Northern Ireland"]
    },
    in: {
        name: "India",
        states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"]
    }
};

// Home route with top headlines
app.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'us',
                apiKey: API_KEY,
                q: searchQuery,
                pageSize: 20
            }
        });

        res.render("index", {
            articles: response.data.articles || [],
            activeTab: 'home',
            searchQuery: searchQuery
        });
    } catch (error) {
        console.error('Home page error:', error.message);
        res.render("error", { 
            error: "Unable to fetch news. Please try again later.",
            activeTab: 'home'
        });
    }
});

// Country specific route
app.get("/country/:code", async (req, res) => {
    try {
        const countryCode = req.params.code.toLowerCase();
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: countryCode,
                pageSize: 20,
                apiKey: API_KEY
            }
        });

        res.render("country.ejs", {
            articles: response.data.articles || [],
            countryCode: countryCode,
            countries: countries,
            activeTab: 'country'
        });
    } catch (error) {
        console.error('Country page error:', error.message);
        res.render("error.ejs", {
            error: "Unable to fetch country news. Please try again later.",
            activeTab: 'country',
            countries: countries
        });
    }
});

// Category routes
const categories = ['technology', 'business', 'sports'];
categories.forEach(category => {
    app.get(`/${category}`, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const country = req.query.country || 'us';
            
            const response = await axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    category: category,
                    country: country,
                    page: page,
                    pageSize: 20,
                    apiKey: API_KEY
                }
            });

            const totalResults = response.data.totalResults || 0;
            const totalPages = Math.max(1, Math.ceil(totalResults / 20));

            res.render("category", {
                articles: response.data.articles || [],
                category: category,
                currentPage: page,
                totalPages: totalPages,
                activeTab: category,
                countries: countries,
                currentCountry: country
            });
        } catch (error) {
            console.error('Category page error:', error.message);
            res.render("error", {
                error: `Unable to fetch ${category} news. Please try again later.`,
                activeTab: category,
                countries: countries
            });
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});