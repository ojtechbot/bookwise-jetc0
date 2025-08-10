# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## First-time Setup

To ensure the application works correctly with pre-populated data (including the default admin account), you need to seed the database.

Run the following command in your terminal **once** before you start the development server:

```bash
npm run db:seed
```

This will securely create the initial admin account and populate the library with books.

**Default Admin Credentials:**
- **Email:** `admin@libroweb.io`
- **Password:** `admin123`
