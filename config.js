/** Common config for bookstore. */

let DB_URI = `postgresql://postgres:1234567890@localhost:5433`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/bookstest`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}

module.exports = { DB_URI };
