# SplitBills

A simple yet complete expense splitting web application built with the MERN stack. 

## 🚀 Features

### Authentication
- User registration and login with email/password
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes

### Group Management
- Create groups/events (Trip, Roommates, Party, etc.)
- Generate unique join codes
- Join groups using join codes
- View group members

### Expense Management
- Add expenses with title, amount, and date
- Automatic equal splitting among group members
- Track who paid for each expense
- View expense history

### Balance Calculation
- Real-time balance calculation for each user
- Display net balance (owe/receive)
- Simple and readable balance overview

### Settlement
- Record settlements between users
- Settlement history tracking
- Update balances after settlements

### Dashboard
- Overview of all groups
- Total amount owed and to receive
- Quick access to create/join groups

## 🛠 Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Dark minimal UI (black, grey, white)

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express validator for input validation

## 📁 Project Structure

```
splitBills/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Settlement.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── groups.js
│   │   └── expenses.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Groups/
│   │   │   ├── Expenses/
│   │   │   └── Layout/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-splitter
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` file with your MongoDB connection string:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-splitter
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start:
   - Backend server on http://localhost:5000
   - Frontend server on http://localhost:3000

### Alternative: Start servers separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### Group Model
```javascript
{
  name: String,
  description: String,
  joinCode: String (unique, auto-generated),
  createdBy: ObjectId (User),
  members: [ObjectId (User)],
  timestamps: true
}
```

### Expense Model
```javascript
{
  title: String,
  amount: Number,
  date: Date,
  paidBy: ObjectId (User),
  group: ObjectId (Group),
  splits: [{
    user: ObjectId (User),
    amount: Number
  }],
  timestamps: true
}
```

### Settlement Model
```javascript
{
  group: ObjectId (Group),
  payer: ObjectId (User),
  receiver: ObjectId (User),
  amount: Number,
  settledAt: Date,
  timestamps: true
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Groups
- `POST /api/groups` - Create new group
- `POST /api/groups/join` - Join group with code
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get single group

### Expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/group/:groupId` - Get group expenses
- `GET /api/expenses/balances/:groupId` - Get group balances
- `POST /api/expenses/settle` - Record settlement
- `GET /api/expenses/settlements/:groupId` - Get settlements

## 💡 Balance Calculation Logic

The balance calculation works as follows:

1. **For each user in a group:**
   - `totalPaid` = Sum of all expenses paid by the user
   - `totalOwed` = Sum of all expense splits assigned to the user
   - `netBalance` = totalPaid - totalOwed

2. **Interpretation:**
   - `netBalance < 0` = User owes money
   - `netBalance > 0` = User should receive money
   - `netBalance = 0` = User is settled up

3. **Settlements:**
   - When a settlement is recorded, it adjusts the balances
   - Payer's totalPaid increases
   - Receiver's totalOwed decreases

## 🎨 UI Design

- **Dark Theme Only:** Black background with grey cards and white text
- **Minimal Design:** Clean cards, simple forms, no animations
- **Responsive:** Works on desktop and mobile
- **Color Coding:**
  - Red: Money owed
  - Green: Money to receive
  - White: Neutral/settled

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- Error handling middleware

## 📱 Usage Flow

1. **Register/Login** to create an account
2. **Create a Group** or **Join** using a code
3. **Add Expenses** as they occur
4. **View Balances** to see who owes what
5. **Settle Up** when payments are made
6. **Track History** of all expenses and settlements

---

**Built with ❤️ by Nikhil**