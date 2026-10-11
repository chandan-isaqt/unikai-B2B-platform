# Unikai B2B Platform

A full-stack B2B product catalogue and wholesale ordering platform for **Unikai Foods PJSC**, serving Oman and the GCC region.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Mobile App:** Flutter (Android & iOS)
- **Authentication:** JWT
- **Integrations:** WhatsApp ordering, optional Cloudinary

## Features

- Product catalogue with categories and brands
- Product details and pricing
- B2B customer authentication and profiles
- Shopping cart and wholesale ordering
- Order management
- Admin dashboard and product management
- Salesman contact and WhatsApp ordering
- Flutter mobile application

## Project Structure

```text
unikai-B2B-platform/
├── web/
│   ├── frontend/   # React website & Admin Panel
│   └── backend/    # Node.js REST API
├── flutter_app/    # Flutter Android & iOS app
├── README.md
└── .gitignore
```

## Deployment

- **Backend:** Render
- **Frontend:** Render Static Site
- **Database:** MongoDB Atlas

## API

Backend health check:

`/api/health`

## Getting Started

Clone the repository:

```bash
git clone https://github.com/chandan-isaqt/unikai-B2B-platform.git
cd unikai-B2B-platform
```

Install dependencies in `web/backend` and `web/frontend`, configure environment variables using the provided `.env.example` files, and follow the setup instructions for each application.

**Note:** Never commit `.env` files, passwords, API keys, or other secrets to GitHub.
