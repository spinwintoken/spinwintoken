const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// API route
app.post("/api/spin", require("./api/spin.js"));

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
