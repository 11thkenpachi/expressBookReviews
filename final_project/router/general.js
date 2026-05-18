const express = require("express");
const axios = require("axios");
let books = require("../books.js");
const public_users = express.Router();

const { users, isValid } = require("./auth_users.js");

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 10 – Get all books (async/await with Axios)
public_users.get("/", async (req, res) => {
  try {
    // Using a local promise to simulate async fetch
    const getBooks = () =>
      new Promise((resolve) => {
        resolve(books);
      });
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books", error: err.message });
  }
});

// Task 11 – Get book by ISBN (promise callback)
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject(new Error("Book not found"));
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 12 – Get books by author (async/await)
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const getByAuthor = () =>
      new Promise((resolve, reject) => {
        const results = Object.entries(books)
          .filter(([, book]) => book.author.toLowerCase().includes(author))
          .reduce((acc, [isbn, book]) => {
            acc[isbn] = book;
            return acc;
          }, {});
        if (Object.keys(results).length > 0) resolve(results);
        else reject(new Error("No books found for this author"));
      });
    const result = await getByAuthor();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Task 13 – Get books by title (async/await)
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const getByTitle = () =>
      new Promise((resolve, reject) => {
        const results = Object.entries(books)
          .filter(([, book]) => book.title.toLowerCase().includes(title))
          .reduce((acc, [isbn, book]) => {
            acc[isbn] = book;
            return acc;
          }, {});
        if (Object.keys(results).length > 0) resolve(results);
        else reject(new Error("No books found with this title"));
      });
    const result = await getByTitle();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Get book reviews by ISBN
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
