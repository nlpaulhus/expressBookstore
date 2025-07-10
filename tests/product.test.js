process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app.js");
const db = require("../db.js");

let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
        INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
        '1234567890',
        'https://amazon.com/bookybook',
        'Samantha',
        'Spanish',
        200,
        'Hatchett Books',
        'Big Book',
        2024)
        RETURNING isbn`);
  book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
  test("Gets one book", async function () {
    const res = await request(app).get("/books");
    const books = res.body.books;
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("isbn");
    expect(books[0]).toHaveProperty("amazon_url");
  });
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const newBook = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).post("/books").send(newBook);
    const book = res.body.book;
    expect(book).toHaveProperty("isbn");
    expect(book).toHaveProperty("amazon_url");
  });

  test("Checks for a bad book add", async function () {
    const newBook = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /books/[isbn]", function () {
  test("Gets one book based on isbn", async function () {
    const res = await request(app).get(`/books/${book_isbn}`);
    const book = res.body.book;
    expect(book).toHaveProperty("isbn");
    expect(book.isbn).toBe(book_isbn);
  });

  test("Respons 404 if can't find book", async function () {
    const res = await request(app).get(`/books/2`);
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /books/[isbn]", function () {
  test("Updates book based on isbn", async function () {
    const res = await request(app).put(`/books/${book_isbn}`).send({
      amazon_url: "http://amazon.com/newbook",
      author: "test",
      language: "parseltongue",
      pages: 2000,
      publisher: "your mom",
      title: "new book",
      year: 1989,
    });
    const updatedBook = res.body.book;
    expect(updatedBook.isbn).toBe(book_isbn);
    expect(updatedBook.title).toBe("new book");
  });

  test("Checks for bad book update", async function () {
    const res = await request(app).put(`/books/${book_isbn}`).send({
      amaz_url: "http://amazon.com/newbook",
      author: "test",
      language: 5,
      pages: 2000,
      publisher: "your mom",
      title: "new book",
      year: 1989,
    });
    console.log(res.body.book);
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /books/[isbn]", function () {
  test("Deletes one book based on isbn", async function () {
    const res = await request(app).delete(`/books/${book_isbn}`);
    expect(res.body.message).toBe("Book deleted");
  });
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end();
});
