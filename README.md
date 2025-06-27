# GymCrush - Where Strength Meets Chemistry

A fitness-focused dating app built with the MERN stack and Vite, designed to connect fitness enthusiasts looking for workout partners and romantic connections.

## 🏋️ Features

- **Profile Creation**: Showcase your fitness journey with photos, interests, and workout preferences
- **Smart Matching**: Find compatible gym partners based on fitness interests and goals
- **Crush System**: Send crushes to show interest - when both users crush each other, it's a match!
- **Real-time Messaging**: Chat with your matches using Socket.io
- **Premium Memberships**: Unlimited crushes with subscription options
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Payments**: Stripe
- **Styling**: CSS3 with custom properties

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gymcrush.git
cd gymcrush
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:5173
PORT=5001
```

4. Run the development servers:
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Backend
npm run server

# Frontend
npm run client
```

## 🏗️ Project Structure

```
gymcrush/
├── src/
│   ├── frontend/
│   │   ├── components/
│   │   ├── assets/
│   │   └── main.jsx
│   └── backend/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── services/
├── public/
├── server.js
├── vite.config.js
└── package.json
```

## 📱 Key Components

- **Authentication**: Secure user registration and login
- **Profile Management**: Complete profile creation with photos and prompts
- **Browse Interface**: Swipe-style browsing of potential matches
- **Crush System**: Send and receive crushes, track matches
- **Messaging**: Real-time chat with matches
- **Subscription**: Stripe integration for premium features

## 🚢 Deployment

The app is configured for deployment on Render:

1. Build command: `npm run build`
2. Start command: `npm start`
3. Set environment variables in Render dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**GymCrush** - Find your swolemate today! 💪❤️