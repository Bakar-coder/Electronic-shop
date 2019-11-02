if (process.env.NODE_ENV === "production") module.exports = { mongoURI: "" };
module.exports = { mongoURI: "mongodb://localhost:27017/node-shop" };
