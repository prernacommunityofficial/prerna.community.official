# PRERNA API

Base URL: `http://localhost:5000/api`

## Authentication

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

Administrative routes use `Authorization: Bearer <accessToken>`.

## Public resources

- `GET /projects`
- `GET /projects/:slug`
- `GET /team`
- `GET /problems`
- `POST /problems`
- `POST /applications`
- `POST /contact`
- `GET /settings`

## Administration

- Projects: `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id`
- Team: `POST /team`, `PUT /team/:id`, `DELETE /team/:id`
- Problems: `GET /problems/admin`, `PUT /problems/:id`, `DELETE /problems/:id`
- Applications: `GET /applications`, `PUT /applications/:id`, `DELETE /applications/:id`
- Enquiries: `GET /contact`, `PUT /contact/:id`, `DELETE /contact/:id`
- Dashboard: `GET /dashboard/stats`, `GET /dashboard/analytics`, `GET /dashboard/recent-activities`
- Settings: `PUT /settings`
