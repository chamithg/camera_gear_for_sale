const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// setup database
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("SHOP.db", (err) => {
  if (err) {
    return console.error("Error opening database:", err.message);
  }
  console.log("Connected to the SHOPs database.");
});

// create inventory table
db.run(
  `
  CREATE TABLE IF NOT EXISTS INVENTORY (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT
  )
`,
  (err) => {
    if (err) {
      return console.error("Error creating inventory table:", err.message);
    }
    console.log("inventory table created (if it didn't already exist).");
  }
);

// create user table
db.run(
  `
  CREATE TABLE IF NOT EXISTS USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`,
  (err) => {
    if (err) {
      return console.error("Error creating users table:", err.message);
    }
    console.log("users table created (if it didn't already exist).");
  }
);

// create cart items table

db.run(
  `
  CREATE TABLE IF NOT EXISTS CART_ITEMS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
  )
`,
  (err) => {
    if (err) {
      return console.error("Error creating cart items table:", err.message);
    }
    console.log("cart items table created (if it didn't already exist).");
  }
);

// server.js
// A simple Express.js backend for a Todo list API

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static("public"));

// server index.html
app.get("/", (req, res) => {
  res.sendFile("public/storefront.html");
});
