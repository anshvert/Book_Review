# Book Review API

This is a RESTful API for a Book Review system built with Node.js, Express, and MongoDB. It supports user authentication, book management, reviews, and search functionality with pagination and JWT-based security.

## Features
- **Authentication**: Register and log in users with JWT-based authentication.
- **Book Management**: Create and list books with pagination and optional filters by author or genre.
- **Review System**: Authenticated users can submit, update, or delete their own reviews (one per book).
- **Search**: Case-insensitive partial matching for book titles and authors.
- **Error Handling**: Consistent error messages and HTTP status codes.

## Tech Stack
- **Node.js & Express**: Backend framework for API development.
- **MongoDB & Mongoose**: Database and ORM for structured data storage.
- **jsonwebtoken**: Secure token-based authentication.
- **bcryptjs**: Password hashing for user security.
- **dotenv**: Environment variable management.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or via a cloud provider like MongoDB Atlas)
- Git (for cloning the repository)
- A tool like Postman or `curl` for testing API endpoints

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <https://github.com/anshvert/Book_Review.git>
   cd book-review-api
   ```
2. **Install the Dependencies**:
   ```bash
   pnpm i 
   ```
3. **Configure Environment Variables: Create a .env file in the project root with the following content:**
   ```dotenv
   MONGO_URI=mongodb://localhost:27017/book_review
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```
- Replace **your_jwt_secret_key** with a strong, random string (e.g., run openssl rand -base64 32 in your terminal).
- Ensure MongoDB is running or update **MONGO_URI** with your database connection string.

4. **Start MongoDB: Ensure MongoDB is running on localhost:27017 or provide a valid MongoDB URI in .env.**
5. **Run the Server:**
   ```bash
   npm start
   ```
- The server will run on http://localhost:3000 (or the port specified in .env).

## Database Schema

Below are the Mongoose schemas for the API's data models, formatted for clarity:

- **User**:
  ```javascript
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed with bcrypt
    createdAt: Date,
    updatedAt: Date
  }
  ```
- **Book**:
  ```javascript
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date
  }
  ```
- **Review**:
  ```javascript
    {
      book: { type: ObjectId, ref: 'Book', required: true },
      user: { type: ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      createdAt: Date,
      updatedAt: Date
    }
  ```
- A unique index on { book, user } prevents multiple reviews per user per book.

## Example API Requests

Use the following `curl` commands to test the API. Replace `<your-token>` with the JWT obtained from the login endpoint and `<book-id>` or `<review-id>` with valid IDs from your database.

1. **Register a User:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
   -H "Content-Type: application/json" \
   -d '{"username":"john_doe","password":"password123"}'
   ```
2. **Login to Get JWT:**
    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"john_doe","password":"password123"}'
    ```

3. **Add a Book (Authenticated):**
    ```bash
   curl -X POST http://localhost:3000/api/books \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your-token>" \
    -d '{"title":"The Great Gatsby","author":"F. Scott Fitzgerald","genre":"Fiction"}'
    ```
4. **Get All Books with Pagination and Filters:**
    ```bash
    curl "http://localhost:3000/api/books?page=1&limit=10&author=Fitzgerald&genre=Fiction"
    ```

5. **Get Book Details with Reviews:**
    ```bash
    curl "http://localhost:3000/api/books/<book-id>?page=1&limit=5"
    ```

6. **Submit a Review (Authenticated):**
    ```bash
    curl -X POST http://localhost:3000/api/books/<book-id>/reviews \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your-token>" \
    -d '{"rating":4,"comment":"Really enjoyed the story!"}'
    ```

7. **Update a Review (Authenticated):**
    ```bash
    curl -X PUT http://localhost:3000/api/reviews/<review-id> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <your-token>" \
    -d '{"rating":5,"comment":"Even better on a second read!"}'
    ```

8. **Delete a Review (Authenticated):**
    ```bash
    curl -X DELETE http://localhost:3000/api/reviews/<review-id> \
    -H "Authorization: Bearer <your-token>"
    ```

9. **Search Books:**
    ```bash
    curl "http://localhost:3000/api/books/search?q=Gatsby"
    ```

## Design Decisions

### MongoDB
Chosen for its flexibility with JSON-like documents and ease of use with Mongoose for schema validation and queries.

### JWT Authentication
Implemented for stateless, secure authentication. Tokens are sent in the `Authorization` header as `Bearer <token>` for protected routes.

### Pagination
Added to `GET /books` and `GET /books/:id` endpoints with defaults of **10 books** and **5 reviews** per page to handle large datasets efficiently.

### Search
Uses MongoDB's regex queries for case-insensitive partial matching on book titles and authors, balancing simplicity and functionality.

### Unique Reviews
A compound index on `book` and `user` fields in the Review model ensures users can only review a book once.

### Error Handling
A global middleware catches unexpected errors, logging them and returning user-friendly messages with appropriate HTTP status codes.

### Environment Variables
Sensitive data like `MONGO_URI` and `JWT_SECRET` are stored in a `.env` file, excluded from version control via `.gitignore`.

---

## Assumptions

- Users are limited to **one review per book**, enforced by a unique index in the Review model.
- Reviews require a **rating (1–5)** and a **comment** to keep the system simple and consistent.
- Pagination defaults (**10 books, 5 reviews**) are reasonable for typical use cases but can be adjusted via query parameters.
- Input validation is minimal to meet assignment scope; a production system would use a library like **Joi** for stricter checks.
- **MongoDB is assumed to be running locally** or accessible via a provided URI.

---

## Future Improvements

- Add **input validation** with a library like Joi to ensure robust data integrity.
- Implement **rate limiting** to prevent API abuse (e.g., using `express-rate-limit`).
- Support **sorting options** for books (e.g., by title or creation date) and reviews (e.g., by rating).
- Introduce **caching with Redis** for frequently accessed endpoints like book lists.
- Enhance the **search endpoint** with additional filters, such as by genre or average rating.
