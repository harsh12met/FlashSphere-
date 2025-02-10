import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

const app = express();
const port = 3000;

app.use(express.static("public"));
dotenv.config();

app.get("/" , async (req,res)=>{
    try {
        const result = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`);
        const firstArticle = result.data.articles;
        res.render("index.ejs",{
            articles : firstArticle
        });
    } catch (error) {
        console.log(error.result.data);
        res.status(500);
      }
});

app.listen(port,()=>{
    console.log("Server Started On Port "+port);
})