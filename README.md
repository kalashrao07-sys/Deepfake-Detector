# 🛡️ DeepGuard — Deepfake Detection & Fake Media Verification System

A full-stack web application for detecting AI-generated and deepfake media.
Built with React.js, Node.js/Express, and MySQL (XAMPP).

---

## 📁 Project Structure

```
deepfake-detection/
├── backend/
│   ├── config/
│   │   └── db.js                # MySQL database connection
│   ├── controllers/
│   │   ├── authController.js    # Register & Login logic
│   │   ├── uploadController.js  # File upload + AI detection logic
│   │   └── adminController.js   # Admin panel logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth API routes
│   │   ├── uploadRoutes.js      # Upload API routes
│   │   └── adminRoutes.js       # Admin API routes
│   ├── uploads/                 # Uploaded files stored here
│   ├── .env                     # Environment variables
│   ├── server.js                # Main Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js        # Navigation bar
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── Register.js      # User registration
│   │   │   ├── Login.js         # User login
│   │   │   ├── Dashboard.js     # User dashboard
│   │   │   ├── Detect.js        # Main detection page
│   │   │   ├── Reports.js       # Scan history & reports
│   │   │   └── Admin.js         # Admin panel
│   │   ├── services/
│   │   │   └── api.js           # All axios API calls
│   │   ├── App.js               # React Router setup
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   └── package.json
│
├── database.sql                 # SQL to create tables
└── README.md
```

---

## ⚙️ SETUP INSTRUCTIONS (Step by Step)

### STEP 1: Install XAMPP and Start Servers

1. Download XAMPP from: https://www.apachefriends.org/
2. Open XAMPP Control Panel
3. Click **START** next to **Apache**
4. Click **START** next to **MySQL**
5. Both should show green "Running" status

---

### STEP 2: Create the Database

1. Open your browser and go to: **http://localhost/phpmyadmin**
2. Click on **SQL** tab at the top
3. Copy the contents of `database.sql` file
4. Paste it into the SQL editor
5. Click **Go** to execute
6. You should see: `deepfake_detection_system` database created ✅

**OR manually:**
1. Click **New** in the left sidebar
2. Type: `deepfake_detection_system`
3. Click **Create**
4. Then import the `database.sql` file via Import tab

---

### STEP 3: Setup the Backend

Open a terminal/command prompt:

```bash
# 1. Go to the backend folder
cd deepfake-detection/backend

# 2. Install all packages
npm install

# 3. Start the backend server
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully!
🚀 Deepfake Detection Backend Running!
🌐 Server: http://localhost:5000
```

---

### STEP 4: Setup the Frontend

Open a **second terminal**:

```bash
# 1. Go to the frontend folder
cd deepfake-detection/frontend

# 2. Install all packages
npm install

# 3. Start the React app
npm start
```

Browser will open at: **http://localhost:3000** 🎉

---

## 🔑 Default Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@deepfake.com     |
| Password | admin123               |
| Role     | admin                  |

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint         | Description       |
|--------|-----------------|-------------------|
| POST   | `/register`     | Register new user |
| POST   | `/login`        | Login user        |

### Upload Routes (`/api/upload`)
| Method | Endpoint             | Description              |
|--------|---------------------|--------------------------|
| POST   | `/`                 | Upload & analyze a file  |
| GET    | `/history/:userId`  | Get user upload history  |
| GET    | `/report/:uploadId` | Get a specific report    |
| POST   | `/report`           | Submit a fake report     |

### Admin Routes (`/api/admin`)
| Method | Endpoint         | Description           |
|--------|-----------------|----------------------|
| GET    | `/uploads`      | Get all uploads      |
| GET    | `/users`        | Get all users        |
| DELETE | `/upload/:id`   | Delete an upload     |
| GET    | `/stats`        | Get dashboard stats  |

---

## 🧠 How the Detection Works

The system uses a **rule-based scoring algorithm** to simulate AI detection:

1. **File Size Analysis** — Very small images (< 50KB) are more likely AI-generated
2. **File Type Check** — JPEG/JPG from cameras score higher authenticity
3. **Filename Pattern** — Camera-style names like `IMG_1234.jpg` score as real; generic names like `image.png` or `generated_1.jpg` score lower
4. **Random Noise** — Small variation (±10%) for realistic results
5. **Final Score** — Score ≥ 50% → "Real"; Score < 50% → "Fake"

### Score Interpretation:
- **70–100%** Authenticity → Likely **Real**
- **30–50%** Authenticity → Likely **Fake**
- **10–30%** Authenticity → Likely **AI Generated**

---

## 🎯 Features

| Feature | Status |
|---------|--------|
| User Registration | ✅ |
| User Login | ✅ |
| Image Upload | ✅ |
| Video Upload | ✅ |
| AI Detection Analysis | ✅ |
| Authenticity Score | ✅ |
| Real-Time Progress Bar | ✅ |
| Upload History | ✅ |
| Report Fake Content | ✅ |
| Admin Dashboard | ✅ |
| View All Uploads (Admin) | ✅ |
| Delete Uploads (Admin) | ✅ |
| View All Users (Admin) | ✅ |
| Responsive UI | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios |
| Styling | Custom CSS + Bootstrap |
| Icons | React Icons |
| Backend | Node.js, Express.js |
| Database | MySQL (via XAMPP) |
| File Upload | Multer |
| Environment | dotenv |

---

## 📝 FYQs

1. **Why simulated AI?** — Real deepfake detection requires massive training datasets and GPU. For a mini-project, rule-based scoring demonstrates the concept effectively.

2. **How does the score work?** — We analyze file properties (size, type, name patterns) to generate a confidence score. Score ≥ 50% → Real, otherwise Fake.

3. **Why MySQL over MongoDB?** — MySQL is relational and fits our structured data (users, uploads, reports with foreign keys).

4. **Why Multer?** — Multer is the standard middleware for handling multipart/form-data (file uploads) in Express.

5. **Where are files stored?** — In `backend/uploads/` folder, accessible at `http://localhost:5000/uploads/filename`.

6. **How is login handled?** — Simple email/password check against database, user stored in `localStorage`.

---

## ⚠️ Troubleshooting

**MySQL connection failed:**
- Make sure XAMPP MySQL is running
- Check `.env` file has correct DB name
- Run the `database.sql` file in phpMyAdmin

**Port 3000 or 5000 already in use:**
```bash
# Kill the process using the port
npx kill-port 3000
npx kill-port 5000
```

**Module not found errors:**
```bash
# Re-install dependencies
npm install
```
