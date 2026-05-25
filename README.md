# Vivian's Flowers — Pixel-Art Flower Shop
## 1. Project Overview

Vivian's Flowers is a modern full-stack e-commerce flower shop website built with a pixel-art game-inspired visual style.
The project simulates an online flower shopping platform where users can browse products, search flowers in real time, manage shopping carts, and place orders through a seamless single-page application experience.

The website combines a React frontend, FastAPI backend, and MongoDB database to provide a responsive and interactive shopping experience.
It also includes JWT-based authentication and role-based access control for normal users and administrators.

## 2. Work Allocation
Team member: ShiyingGu 25934593 ; Yuhan Sun 25168360; Zhonghe Wang 25744879

This project was extended from Yuhan’s Assignment 1 project, which already included part of foundational structure and core functionality of the flower shop website, such as:
- product display
- shopping cart interaction
- basic homepage frontend architecture
Assignment 2 further expanded the project into a full-stack single-page application with authentication, database integration, admin features, and advanced frontend interactions.

### Shiying Gu 25934593
- Developed the admin dashboard and admin-related features
- Implemented product management functionality for administrators
- Implemented user management and shopping cart viewing functionality for admins

### Yuhan Sun 25168360
- Designed and implemented the overall UI/UX of the website
- Developed the pixel-art visual style and responsive frontend layout
- Implemented the live product search functionality
- Refined and integrated frontend interactions and visual components

### Zhonghe Wang 25744879
- Implemented user authentication and authorization features
- Developed registration and login functionality
- Implemented password hashing and JWT verification

Specific file-level contributions are indicated in the author comments at the top of source files.
Git commit history in the shared repository additionally reflects individual contributions.

## 3. Main Features
### 3.1 User Features
User registration and login
Password hashing with bcrypt
JWT authentication
Persistent login using localStorage
Real-time product search
Product category filtering
Product detail modal
Shopping cart sidebar
Add / remove / update cart items
Responsive single-page application interface
### 3.2 Admin Features
Admin login system
Product management dashboard
Add new products
Edit existing products
Delete products
View all users’ shopping carts

## 4. Technical Stack
### 4.1 Frontend
React
React Hooks (useState, useEffect)
CSS3
Fetch API
### 4.2 Backend
FastAPI
Python
JWT Authentication
bcrypt password hashing
### 4.3 Database
MongoDB
Motor (Async MongoDB Driver)

## 5. Project Structure

PIXEL-FLOWER-SHOP
│
├── backend
│   ├── routes
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── cart.py
│   │   └── products.py
│   │
│   ├── .env
│   ├── auth_utils.py
│   ├── database.py
│   ├── fix_admin.py
│   ├── main.py
│   ├── models.py
│   ├── seed.py
│   ├── seed_users.py
│   └── requirements.txt
│
├── database_export
│   ├── cart_items.json
│   ├── products.json
│   └── users.json
│
├── frontend
│   ├── public
│   │   └── images
│   │
│   ├── src
│   │   ├── admin
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── admin.css
│   │   │
│   │   ├── components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductList.jsx
│   │   │
│   │   ├── App.js
│   │   └── App.css
│   │
│   └── package.json
│
└── README.md

## 6. Database Entities

The project includes CRUD operations for at least three major entities:

1) User
2) Product
3) Shopping Cart

## 7. Authentication and Security

The project implements secure authentication and authorization features:

Password hashing using bcrypt
JWT token authentication
Role-based access control
Protected admin features
Persistent login sessions using localStorage

## 8. Test Accounts
### Admin Account
Email: admin@test.com
Password: admin
### User Account
Email: Lily@gmail.com
Password: 123456lily

## 9. Installation and Setup
### 9.1 GitHub Repository
https://github.com/Mume45/Ass-2-pixel-flower-shop
For security reasons, the `.env` file is not included in the repository.

### 9.2 Backend Setup
#### Navigate to backend folder
```bash
cd backend

#### Create virtual environment
python -m venv .venv

#### Activate virtual environment
##### Windows
.venv\Scripts\activate

##### Mac/Linux
source .venv/bin/activate

#### Install dependencies
pip install -r requirements.txt

#### Run FastAPI server
python -m uvicorn main:app --reload
Backend server runs on:
http://127.0.0.1:8000


### 9.3 Frontend Setup
#### Navigate to frontend folder
cd frontend
#### Install dependencies
npm install
#### Start React app
npm start
Frontend server runs on:
http://localhost:3000