# PRERNA Backend

Express and MongoDB REST API.

```powershell
npm install
cp .env.example .env
npm run dev
npm test
```

The API uses bcrypt, JWT, Helmet, CORS, rate limiting, Mongoose validation, indexes, and protected administrative routes. Email delivery is not simulated; configure a real provider before enabling email responses.
