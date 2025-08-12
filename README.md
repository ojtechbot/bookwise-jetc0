# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## First-time Setup

To ensure the application works correctly with pre-populated data (including the default admin account), you need to seed the database.

Run the following command in your terminal **once** before you start the development server:

```bash
npm run db:seed
```

This will securely create the initial admin and librarian accounts and populate the library with books.

**Default Credentials:**
- **Admin Email:** `admin@libroweb.io`
- **Admin Password:** `admin123`
- **Librarian Email:** `librarian@libroweb.io`
- **Librarian Password:** `librarian123`

## Features

This application offers a comprehensive set of features for managing a library and interacting with books:

- **User Authentication:** Seamless signup, login, and forgotten password recovery.
- **Admin Dashboard:** Dedicated section for administrators with various settings.
- **User Dashboard:** Personalized dashboard for regular users with their settings.
- **Book Catalog:** Browse and view detailed information for all available books.
- **Book Management:** Authorized users can add, edit, and delete book entries.
- **Book Reviews:** Users can leave and view reviews for books.
- **AI Chatbot:** Interact with an AI chatbot for book recommendations and assistance with searching the catalog.
- **AI Search Suggestions:** Get intelligent suggestions while searching for books.
- **AI Book Summarization:** Generate concise summaries for books using AI.
- **AI Avatar Generation:** Users can generate unique avatars using AI.
- **Responsive Design:** The application is optimized for viewing on various devices and screen sizes.
- **Theme Switching:** Easily toggle between light and dark modes for a personalized viewing experience.

