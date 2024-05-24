# TryNutritions
TryNutrition is built using modern web technologies to ensure a robust and efficient platform. The core technologies used in this project include Express.js for the backend server, MongoDB for the database, and EJS (Embedded JavaScript) templates for rendering dynamic web pages.

## Project Features
1. User and Admin Interface
TryNutrition offers a dual interface for users and administrators:

User Side: Users can browse products, add items to their cart, and make purchases. The user interface is designed to be intuitive and responsive, ensuring a smooth shopping experience.
Admin Side: The admin panel allows administrators to manage products, view orders, and handle other administrative tasks. This side of the application is essential for maintaining the product catalog and overseeing the business operations.

2. Secure Authentication
Security is a top priority for TryNutrition. We use bcryptjs for hashing passwords and jsonwebtoken for handling user authentication. This ensures that user data is protected and access to sensitive areas of the site is restricted to authorized personnel only.

3. Efficient Database Management
Our platform uses MongoDB, a NoSQL database, which is well-suited for handling the diverse and growing data needs of an ecommerce site. The connection to MongoDB is managed through Mongoose, an Object Data Modeling (ODM) library, which provides a straightforward schema-based solution to model our application data.

4. Template Rendering with EJS
EJS templates are used to dynamically generate HTML pages on the server. This allows us to create responsive and interactive web pages that cater to the needs of our users.

Technical Stack and Dependencies
The project leverages several key dependencies:

Express: A minimal and flexible Node.js web application framework.
Mongoose: An ODM for MongoDB to interact with the database using JavaScript objects.
EJS: A templating engine that integrates seamlessly with Express to render HTML templates.
Body-Parser: Middleware to parse incoming request bodies.
Cookie-Parser: Middleware to parse cookies.
Multer: Middleware for handling file uploads.
Cloudinary: For handling image uploads and storage.
Nodemailer: For sending emails, such as order confirmations.
Razorpay: For integrating payment gateways.
