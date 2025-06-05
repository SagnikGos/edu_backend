# Chapter Performance Dashboard API

A RESTful API backend for a Chapter Performance Dashboard, built as a sample task for MathonGo. This project demonstrates API design, data filtering, caching with Redis, rate limiting, and other backend best practices.

## Features

* **RESTful API Endpoints:** For managing and retrieving chapter performance data.
* **Admin-Only Chapter Upload:** Secure endpoint for uploading chapter data via JSON file.
    * Partial uploads: Valid chapters are saved, while chapters with schema validation errors are reported back.
* **Comprehensive Filtering:** Retrieve chapters based on class, unit, status, weak chapter status, and subject.
* **Pagination:** Efficiently load chapter lists with page and limit parameters, including total chapter count.
* **Caching:** Implemented Redis caching for the main chapter listing endpoint (`/api/v1/chapters`) for 1 hour to optimize performance, with cache invalidation on new chapter additions.
* **Rate Limiting:** Protects API routes by allowing only 30 requests per minute per IP address, utilizing Redis.
* **Modular Code Structure:** Organized code for maintainability and scalability.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB 
* **Caching & Rate Limiting:** Redis (with `ioredis`)
* **File Uploads:** Multer
* **Environment Variables:** Dotenv

## API Endpoints

The base URL for all API endpoints is `/api/v1`.

---

### 1. Upload Chapters

* **Endpoint:** `POST /chapters`
* **Description:** Allows an admin to upload a JSON file containing an array of chapter objects. The backend parses the file, validates each chapter, saves valid ones, and returns a summary including any chapters that failed validation.
* **Authentication:** Admin-only. Requires `x-admin-api-key` header.
* **Request:**
    * **Headers:**
        * `x-admin-api-key`: `<YOUR_ADMIN_API_KEY>`
    * **Body:** `form-data`
        * **Field name:** `chaptersFile`
        * **File:** A JSON file containing an array of chapter objects.
* **Success Response (201 Created or 207 Multi-Status):**
    ```json
    {
        "message": "Chapter upload process completed.",
        "totalProcessed": 5,
        "uploadedCount": 3,
        "failedCount": 2,
        "uploadedChapters": [
            { "id": "someMongoId1", "chapter": "Chapter Name 1" },
            // ... other uploaded chapters
        ],
        "failedChapters": [
            {
                "data": { "subject": "Invalid Data", "chapter": "Test Invalid" /* ... */ },
                "error": "Chapter validation failed: class: Class is required"
            }
            // ... other failed chapters
        ]
    }
    ```
* **Error Responses:**
    * `400 Bad Request`: No file uploaded, invalid JSON file, schema validation error for all entries.
    * `401 Unauthorized`/`403 Forbidden`: Missing or incorrect admin API key.
    * `429 Too Many Requests`: If rate limit exceeded.

---

### 2. Get All Chapters

* **Endpoint:** `GET /chapters`
* **Description:** Retrieves a paginated list of all chapters. Supports filtering.
* **Query Parameters (Optional):**
    * `subject` (String): Filter by subject name (e.g., `Physics`).
    * `class` (String): Filter by class (e.g., `Class 11`).
    * `unit` (String): Filter by unit name.
    * `status` (String): Filter by status (e.g., `Completed`, `Not Started`, `In Progress`).
    * `weakChapters` (Boolean String - "true" or "false"): Filter by whether the chapter is marked as weak.
    * `page` (Number): Page number for pagination (default: `1`).
    * `limit` (Number): Number of items per page (default: `10`).
* **Success Response (200 OK):**
    ```json
    {
        "message": "Chapters retrieved successfully",
        "totalChapters": 101,
        "currentPage": 1,
        "totalPages": 11,
        "chapters": [
            {
                "_id": "6841b86461191d0e0a27a67a",
                "subject": "Mathematics",
                "chapter": "Probability",
                "class": "Class 12",
                // ... other fields
                "createdAt": "2025-06-05T15:31:48.836Z",
                "updatedAt": "2025-06-05T15:31:48.836Z"
            }
            // ... other chapters for the current page
        ]
    }
    ```
* **Error Responses:**
    * `400 Bad Request`: Invalid pagination parameters.
    * `429 Too Many Requests`: If rate limit exceeded.
    * `500 Internal Server Error`: Server-side issues.

---

### 3. Get Specific Chapter by ID

* **Endpoint:** `GET /chapters/:id`
* **Description:** Retrieves a single chapter by its unique MongoDB ObjectId.
* **Path Parameters:**
    * `id` (String): The ObjectId of the chapter.
* **Success Response (200 OK):**
    ```json
    {
        "message": "Chapter retrieved successfully",
        "chapter": {
            "_id": "6841b86461191d0e0a27a67a",
            "subject": "Mathematics",
            "chapter": "Probability",
            // ... all chapter fields
        }
    }
    ```
* **Error Responses:**
    * `400 Bad Request`: Invalid chapter ID format.
    * `404 Not Found`: Chapter with the given ID not found.
    * `429 Too Many Requests`: If rate limit exceeded.
    * `500 Internal Server Error`: Server-side issues.

---

## Setup and Installation (Local Development)

### Prerequisites

* Node.js (v16 or higher recommended)
* npm (comes with Node.js)
* MongoDB (local instance or a cloud service like MongoDB Atlas)
* Redis (local instance or a cloud service like Upstash)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/SagnikGos/edu_backend](https://github.com/SagnikGos/edu_backend)
    cd edu_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables. A `.env.example` file can be used as a template:

    ```env
    # .env.example
    PORT=5000

    # MongoDB Connection URI
    MONGO_URI=mongodb://localhost:27017/chapterPerformanceDB # Replace with your MongoDB URI

    # Redis Connection 
    REDIS_URL=redis://your_redis_connection_string # e.g., redis://default:password@host:port

    # Admin API Key for chapter uploads
    ADMIN_API_KEY=your_secret_admin_key_for_uploads

    # Setup Upload File Size
    MAX_FILE_SIZE=5242880 # 5MB in Bytes
    ```

4.  **Run the application:**
    * For development (with automatic restarts using nodemon):
        ```bash
        npm run dev
        ```
    * For production:
        ```bash
        npm start
        ```
    The server will start on the port specified in your `.env` file (default: 5002).

## Deployment

This application is deployed on Render.
**Live API URL:** `https://edu-backend-0sgn.onrender.com` 

## Postman Collection

A Postman collection with all the API routes, pre-populated data examples, and environment variables is available for easy testing:

[View Postman Collection](https://www.postman.com/sagikage/workspace/mathongo-backend) 

## Author

* Sagnik Goswami

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details (optional: if you add a LICENSE file).
