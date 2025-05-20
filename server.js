const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");

// setup database
const sqlite3 = require("sqlite3").verbose();

const SALT_ROUNDS = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "focus123",
    resave: false,
    saveUninitialized: false,
  })
);

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

//populate table

// db.serialize(() => {
//   const stmt = db.prepare(`
//     INSERT INTO INVENTORY (name, description, price, image_url)
//     VALUES (?, ?, ?, ?)
//   `);

//   const items = [
//     ["Cannon 6D mark 1", "black", 990.0, "images/camera/cam4"],
//     ["Cannon 5D mark 3", "black", 1200.0, "images/camera/cam5"],
//     ["Cannon 100-300mm f4", "black", 2000.0, "images/camera/lens1"],
//     ["Cannon 24-70mm f3.5 - 5", "black", 850.0, "images/camera/lens2"],
//     ["Cannon 50mm f1.8", "black", 500.0, "images/camera/lens3"],
//     ["Cannon 70-200mm f2", "black", 1800.0, "images/camera/lens4"],

//     ["Cannon 60-600mm f4.5-6.3", "black", 3200.0, "images/camera/lens5"],
//     ,
//     ["Neewer strobe light v2", "black", 1200.0, "images/camera/light1"],
//     ["Neewer Video Tripod v2", "black", 450.0, "images/camera/tripod1"],
//     ["Neewer mobile Tripod v2", "orange", 400.0, "images/camera/tripod2"],
//     ["Peak design camera bag ", "gray", 250.0, "images/camera/bag1"],
//     ["Cannon 4D mark 1", "black", 1700.0, "images/camera/cam3"],
//     ["Sony Alpha A4", "silver", 2200.0, "images/camera/cam2"],
//     ["Cannon 5D mark4", "Black", 2500.0, "images/camera/cam1"],
//   ];

//   for (const item of items) {
//     stmt.run(item, (err) => {
//       if (err) console.error("Insert error:", err.message);
//     });
//   }

//   stmt.finalize(() => {
//     console.log("All items inserted into inventory.");
//   });
// });

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

// populate items table

// server.js
// A simple Express.js backend for a Todo list API

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static("public"));

// server index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "storefront.html"));
});

// retrive inventory

app.get("/api/inventory", (req, res) => {
  db.all("SELECT * FROM INVENTORY", (err, rows) => {
    if (err) {
      return console.error("Error fetching data:", err.message);
    }
    res.json(rows);
  });
});

// register
app.post("/register", async (req, res) => {
  const { username, email, password, password_confirm } = req.body;

  if (password !== password_confirm) {
    return res.redirect("/login-reg.html?error=password_mismatch");
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const stmt = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    db.run(stmt, [username, email, hash], (err) => {
      if (err) {
        console.error(err.message);
        return res.redirect("/login-reg.html?error=username_exists");
      }
      res.redirect("/login-reg.html?status=created");
    });
  } catch (error) {
    console.error("Hashing failed:", error);
    res.redirect("/login-reg.html?error=server_error");
  }
});

//login

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.redirect("/login-reg.html?error=missing_fields");
  }

  const stmt = `SELECT * FROM USERS WHERE username = ?`;
  db.get(stmt, [username], async (err, user) => {
    if (err) {
      console.error("DB error:", err.message);
      return res.redirect("/login-reg.html?error=server_error");
    }

    if (!user) {
      return res.redirect("/login-reg.html?error=invalid_credentials");
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = { id: user.id, username: user.username };
      return res.redirect("/storefront.html?status=loggedin");
    } else {
      return res.redirect("/login.html?error=invalid_credentials");
    }
  });
});
// logout

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/storefront.html?error=logout_failed");
    }
    res.clearCookie("connect.sid");
    res.redirect("/storefront.html?status=logged_out");
  });
});

app.listen(port, () => {
  console.log(`Todo API server running at http://localhost:${port}`);
});
