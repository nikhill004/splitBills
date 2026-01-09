# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication Routes

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Group Routes

#### Create Group
```http
POST /groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Trip to Goa",
  "description": "Beach vacation expenses"
}
```

#### Join Group
```http
POST /groups/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "joinCode": "ABC123"
}
```

#### Get User's Groups
```http
GET /groups
Authorization: Bearer <token>
```

#### Get Single Group
```http
GET /groups/:id
Authorization: Bearer <token>
```

### Expense Routes

#### Add Expense
```http
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Dinner at restaurant",
  "amount": 1200,
  "groupId": "group_id_here",
  "date": "2024-01-15"
}
```

#### Get Group Expenses
```http
GET /expenses/group/:groupId
Authorization: Bearer <token>
```

#### Get Group Balances
```http
GET /expenses/balances/:groupId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "balances": [
    {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalPaid": 1200,
      "totalOwed": 400,
      "netBalance": 800
    }
  ]
}
```

#### Record Settlement
```http
POST /expenses/settle
Authorization: Bearer <token>
Content-Type: application/json

{
  "groupId": "group_id_here",
  "receiverId": "user_id_to_pay",
  "amount": 500
}
```

#### Get Settlements
```http
GET /expenses/settlements/:groupId
Authorization: Bearer <token>
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "message": "Invalid token"
}
```

### Not Found (404)
```json
{
  "message": "Group not found"
}
```

### Server Error (500)
```json
{
  "message": "Internal server error"
}
```

## Balance Calculation Logic

### How Balances Work

1. **Total Paid**: Sum of all expenses paid by the user
2. **Total Owed**: Sum of all expense splits assigned to the user
3. **Net Balance**: Total Paid - Total Owed

### Balance Interpretation
- **Negative Balance**: User owes money to the group
- **Positive Balance**: User should receive money from the group
- **Zero Balance**: User is settled up

### Settlement Impact
When a settlement is recorded:
- Payer's `totalPaid` increases by settlement amount
- This reduces the payer's debt or increases their credit
- The settlement is tracked in the settlements collection

### Example Calculation

**Scenario**: 3 users in a group
- User A pays ₹300 for dinner (split equally)
- User B pays ₹600 for hotel (split equally)

**Calculations**:
- Each person owes ₹300 (₹100 + ₹200)

**User A**: Paid ₹300, Owes ₹300 → Net Balance: ₹0
**User B**: Paid ₹600, Owes ₹300 → Net Balance: +₹300 (should receive)
**User C**: Paid ₹0, Owes ₹300 → Net Balance: -₹300 (owes money)

**After Settlement**: User C pays ₹300 to User B
- User C's totalPaid becomes ₹300 → Net Balance: ₹0
- All users are now settled up