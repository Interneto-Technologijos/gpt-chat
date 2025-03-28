const express = require("express");
const app = require("./app");

app.use(express.static("../front-end/public"));
