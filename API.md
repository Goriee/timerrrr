# Guild Boss Timer - API Documentation

## Base URL

**Development:** `http://localhost:3001`  
**Production:** `https://your-app.onrender.com`

All endpoints return JSON.

## Authentication

Some endpoints require password authentication. The password is sent in the request body and validated against the hashed value stored in the database.

**Default Password:** `naiwan`

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Get All Bosses

**GET** `/api/bosses`

Returns all bosses ordered by next spawn time.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Dragon Lord",
    "attackType": "magic",
    "level": 80,
    "respawnHours": 24,
    "location": "Dragon Peak",
    "lastKillAt": "2024-01-01T10:00:00.000Z",
    "nextSpawnAt": "2024-01-02T10:00:00.000Z",
    "isScheduled": true
  }
]
```

**Fields:**
- `id` - Unique boss identifier
- `name` - Boss name
- `attackType` - "melee" or "magic"
- `level` - Boss level
- `respawnHours` - Hours until respawn
- `location` - Boss location
- `lastKillAt` - UTC timestamp of last kill (nullable)
- `nextSpawnAt` - UTC timestamp of next spawn (nullable)
- `isScheduled` - Whether boss has scheduled spawn

---

### Get Single Boss

**GET** `/api/bosses/:id`

Returns a single boss by ID.

**Parameters:**
- `id` - Boss ID (path parameter)

**Response:**
```json
{
  "id": 1,
  "name": "Dragon Lord",
  "attackType": "magic",
  "level": 80,
  "respawnHours": 24,
  "location": "Dragon Peak",
  "lastKillAt": "2024-01-01T10:00:00.000Z",
  "nextSpawnAt": "2024-01-02T10:00:00.000Z",
  "isScheduled": true
}
```

**Error Response (404):**
```json
{
  "error": "Boss not found"
}
```

---

### Validate Password

**POST** `/api/auth/check`

Validates admin password.

**Request Body:**
```json
{
  "password": "naiwan"
}
```

**Response:**
```json
{
  "valid": true
}
```

**Error Response (400):**
```json
{
  "error": "Password required"
}
```

---

### Update Boss

**POST** `/api/bosses/:id/update`

Updates boss times. Requires password authentication.

**Parameters:**
- `id` - Boss ID (path parameter)

**Request Body:**
```json
{
  "password": "naiwan",
  "updates": {
    "lastKillAt": "2024-01-01T10:00:00.000Z",
    "nextSpawnAt": "2024-01-02T10:00:00.000Z",
    "respawnHours": 24
  }
}
```

**Update Fields (all optional):**
- `lastKillAt` - ISO 8601 timestamp (nullable)
- `nextSpawnAt` - ISO 8601 timestamp (nullable)
- `respawnHours` - Number of hours

**Response:**
```json
{
  "id": 1,
  "name": "Dragon Lord",
  "attackType": "magic",
  "level": 80,
  "respawnHours": 24,
  "location": "Dragon Peak",
  "lastKillAt": "2024-01-01T10:00:00.000Z",
  "nextSpawnAt": "2024-01-02T10:00:00.000Z",
  "isScheduled": true
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "error": "Invalid password"
}
```

400 Bad Request:
```json
{
  "error": "No updates provided"
}
```

404 Not Found:
```json
{
  "error": "Boss not found"
}
```

---

### Mark Boss as Killed

**POST** `/api/bosses/:id/kill`

Marks boss as killed and auto-calculates next spawn time based on respawnHours. Requires password authentication.

**Parameters:**
- `id` - Boss ID (path parameter)

**Request Body:**
```json
{
  "password": "naiwan"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Dragon Lord",
  "attackType": "magic",
  "level": 80,
  "respawnHours": 24,
  "location": "Dragon Peak",
  "lastKillAt": "2024-01-01T12:00:00.000Z",
  "nextSpawnAt": "2024-01-02T12:00:00.000Z",
  "isScheduled": true
}
```

**Behavior:**
- Sets `lastKillAt` to current time
- Calculates `nextSpawnAt` as current time + respawnHours
- Sets `isScheduled` to true

**Error Responses:**

401 Unauthorized:
```json
{
  "error": "Invalid password"
}
```

404 Not Found:
```json
{
  "error": "Boss not found"
}
```

---

## Error Handling

All endpoints may return:

**500 Internal Server Error:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## CORS

The API accepts requests from the configured FRONTEND_URL.

**Development:** `http://localhost:3000`  
**Production:** Your Vercel app URL

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

## Examples

### Using cURL

**Get all bosses:**
```bash
curl http://localhost:3001/api/bosses
```

**Validate password:**
```bash
curl -X POST http://localhost:3001/api/auth/check \
  -H "Content-Type: application/json" \
  -d '{"password":"naiwan"}'
```

**Mark boss as killed:**
```bash
curl -X POST http://localhost:3001/api/bosses/1/kill \
  -H "Content-Type: application/json" \
  -d '{"password":"naiwan"}'
```

**Update boss times:**
```bash
curl -X POST http://localhost:3001/api/bosses/1/update \
  -H "Content-Type: application/json" \
  -d '{
    "password":"naiwan",
    "updates":{
      "lastKillAt":"2024-01-01T10:00:00.000Z",
      "nextSpawnAt":"2024-01-02T10:00:00.000Z"
    }
  }'
```

### Using JavaScript/TypeScript

**Get all bosses:**
```typescript
const response = await fetch('http://localhost:3001/api/bosses');
const bosses = await response.json();
```

**Mark boss as killed:**
```typescript
const response = await fetch('http://localhost:3001/api/bosses/1/kill', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'naiwan' })
});
const updatedBoss = await response.json();
```

### Using Axios

**Update boss:**
```typescript
import axios from 'axios';

const response = await axios.post('http://localhost:3001/api/bosses/1/update', {
  password: 'naiwan',
  updates: {
    lastKillAt: new Date().toISOString(),
    respawnHours: 12
  }
});
const updatedBoss = response.data;
```

## Data Types

### Boss Object
```typescript
interface Boss {
  id: number;
  name: string;
  attackType: 'melee' | 'magic';
  level: number;
  respawnHours: number;
  location: string;
  lastKillAt: string | null;  // ISO 8601 timestamp
  nextSpawnAt: string | null;  // ISO 8601 timestamp
  isScheduled: boolean;
}
```

### Update Boss Input
```typescript
interface UpdateBossInput {
  lastKillAt?: string;     // ISO 8601 timestamp
  nextSpawnAt?: string;    // ISO 8601 timestamp
  respawnHours?: number;
}
```

## Time Format

All timestamps use **ISO 8601 format** with UTC timezone:
```
2024-01-01T12:00:00.000Z
```

## Security Notes

- Password is never returned in responses
- Password is hashed using bcrypt (cost factor 10)
- Use HTTPS in production
- Consider implementing rate limiting
- Consider using JWT tokens instead of password on each request

---

**API Version:** 1.0.0
