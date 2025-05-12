# CRM Customer Relationship Management System

A modern CRM platform for ingesting customer data, building audience segments, and running personalized campaigns with robust delivery tracking and a clean, intuitive UI.

---

## 🚀 Live Demo

- **Frontend:** ([https://your-frontend-url.vercel.app](https://crmsample-git-main-divyanshrohatgis-projects.vercel.app/))
- **Backend API:** [https://crm-4243.onrender.com](https://crm-4243.onrender.com)
- **API Docs (Swagger):** [https://crm-4243.onrender.com/api-docs](https://crm-4243.onrender.com/api-docs)

---

## 🛠 Tech Stack

- **Frontend:** React.js, Material-UI (Vercel)
- **Backend:** Node.js (Express) (Render)
- **Database:** MongoDB Atlas
- **Pub-Sub:** RabbitMQ (CloudAMQP)
- **Authentication:** Google OAuth 2.0
- **API Docs:** Swagger UI

---

## 📦 Setup Instructions (for local development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-crm-repo.git
   cd your-crm-repo
   ```

2. **Backend Setup**
   - Go to the backend directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file with:
     ```
     MONGODB_URI=your-mongodb-atlas-uri
     RABBITMQ_URL=your-cloudamqp-url
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     SESSION_SECRET=your-session-secret
     FRONTEND_URL=http://localhost:3000
     ```
   - Start the backend:
     ```bash
     npm start
     ```
   - Access API docs at: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

3. **Frontend Setup**
   - Go to the frontend directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file with:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```
   - Start the frontend:
     ```bash
     npm start
     ```
   - Access the app at: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment Notes

- **Frontend** is deployed on Vercel:  
  ([https://your-frontend-url.vercel.app](https://crmsample-git-main-divyanshrohatgis-projects.vercel.app/))
  - Set `REACT_APP_API_URL` in Vercel to your Render backend URL.

- **Backend** is deployed on Render:  
  [https://crm-4243.onrender.com](https://crm-4243.onrender.com)
  - Set all environment variables in Render's dashboard.

- **MongoDB** is hosted on MongoDB Atlas.
- **RabbitMQ** is hosted on CloudAMQP.

---

## 🔐 Authentication

- Only authenticated users (Google OAuth) can access the app.
- On first login, you'll be prompted to sign in with Google.

---

## 🧪 API Documentation

- Visit [https://crm-4243.onrender.com/api-docs](https://crm-4243.onrender.com/api-docs) for Swagger UI and try out all endpoints.

---

## 📝 Demo Data

- Use the Import button in Customers to upload sample data (CSV/XLSX).
- Or use the API to POST customers/orders.

---

## 🖥️ Screenshots

_Add screenshots of the dashboard, segment builder, campaign history, etc._

---

## 📹 Demo Video

_Link to your demo video here._

---

## 👨‍💻 Author

- [Divyansh Rohatgi](https://github.com/divyanshrohatgi)

---

## 📄 License

MIT 
