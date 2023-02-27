const express = require("express");
const authRouter = express.Router();
const bcryptjs = require("bcryptjs");
const uuid = require('uuid');
// const jwt = require("jsonwebtoken");
const { Client } = require("pg");

const authorizedKeys = [
  "ATIuxQfvT11lxkF2",
  "9TxcWF8mLfQ59yRO",
  "qk5bl1tcItvGrHER",
];
const client = new Client({
  user: 'postgres',
  host: 'ridebud.c3ugimlwujc3.ap-south-1.rds.amazonaws.com',
  database: 'ridebud',
  password: 'poilkjmnb55',
  port: 5432,
});
client.connect();

// middleware to check for valid API key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["api-key"];
  if (!apiKey || authorizedKeys.indexOf(apiKey) === -1) {
    return res.status(401).send({ error: "Invalid API key" });
  }
  next();
};
authRouter.post("/api/signup", checkApiKey, async (req, res) => {
  try {
    const { email, password, name, gender, profile_pic, dob,account_created_date } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 8);
    const result = await client.query(
      "INSERT INTO users (email, password, name, gender, profile_pic, dob, account_created_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, password, gender, account_created_date",
      [email, hashedPassword, name, gender, profile_pic, dob, account_created_date]
    );
   

    res.json({ success: true, name, email,password, gender, profile_pic,dob,account_created_date});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
const bcrypt = require('bcryptjs');

authRouter.post('/api/login',checkApiKey, async (req, res) => {
  try{
    const { email, password } = req.body;
  const result = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (result.rowCount === 1) {
    const { name, email,gender,dob,profile_pic,account_created_date, password: hashedPassword } = result.rows[0];
    if (await bcrypt.compare(password, hashedPassword)) {
      const sessionId = uuid.v4(); // Generate a unique session ID
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      console.log(expires);
      await client.query(
        'INSERT INTO sessions (id, user_id, expires) VALUES ($1, $2, $3)',
        [sessionId, email, expires]
      );
      res.cookie('sessionId', sessionId, { expires, httpOnly: true });
      res.cookie('expires', expires, { expires, httpOnly: true });
      res.json({ success: true, name, email,password, gender, profile_pic,dob,account_created_date});
    } else {
      res.status(401).send("Wrong password!");
    }
  } else {
    res.status(401).send("User not found!");
  }
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

  


module.exports = authRouter;
