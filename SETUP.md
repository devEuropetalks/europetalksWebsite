# 🚀 EuropeTalks Setup Guide

This guide will help you set up the EuropeTalks website locally.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env.local` file has been created with placeholder values. You need to fill in your actual credentials:

#### Required Services

1. **PostgreSQL Database**
   - Sign up for [Neon](https://neon.tech/) (free tier available) or use your own PostgreSQL server
   - Get your connection string and update `DATABASE_URL`

2. **Clerk Authentication**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy the publishable key to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy the secret key to `CLERK_SECRET_KEY`

3. **UploadThing (File Uploads)**
   - Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
   - Create a new app
   - Copy the secret to `UPLOADTHING_SECRET`
   - Copy the app ID to `UPLOADTHING_APP_ID`

4. **SMTP Server (Email)**
   - Use your email provider's SMTP settings (Gmail, SendGrid, Mailgun, etc.)
   - For Gmail, enable "Less secure app access" or use App Passwords
   - Update these variables:
     - `EMAIL_SERVER_HOST`
     - `EMAIL_SERVER_PORT`
     - `CONTACT_FORM_EMAIL_SERVER_USER`
     - `CONTACT_FORM_EMAIL_SERVER_PASSWORD`
     - `EVENT_SIGNUP_EMAIL_SERVER_USER`
     - `EVENT_SIGNUP_EMAIL_SERVER_PASSWORD`
     - `CONTACT_FORM_EMAIL_FROM`
     - `EVENT_SIGNUP_EMAIL_FROM`
     - `SEND_TO_EMAIL`

5. **Translation Export API Key**
   - Generate a secure key by running:
     ```bash
     node scripts/generate-export-key.js
     ```
   - Copy the generated key to `TRANSLATIONS_EXPORT_API_KEY`

#### Optional Services

6. **DeepL API** (Optional - for better translations)
   - Go to [DeepL Pro API](https://www.deepl.com/pro-api)
   - Sign up for a free or paid plan
   - Copy your API key to `DEEPL_API_KEY`

---

### 3. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed translations
npm run seed:translations
```

---

### 4. Set Up Admin User

1. Start the development server (see step 5)
2. Sign up for an account at `http://localhost:3000/sign-up`
3. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
4. Navigate to **Users**
5. Click on your user
6. Scroll down to **Public metadata**
7. Click **Edit**
8. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
9. Click **Save**
10. Refresh your browser - you should now see the Admin link in the header

---

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Common SMTP Configurations

### Gmail

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
CONTACT_FORM_EMAIL_SERVER_USER=your.email@gmail.com
CONTACT_FORM_EMAIL_SERVER_PASSWORD=your_app_password
EVENT_SIGNUP_EMAIL_SERVER_USER=your.email@gmail.com
EVENT_SIGNUP_EMAIL_SERVER_PASSWORD=your_app_password
```

**Note**: Use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password.

### SendGrid

```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
CONTACT_FORM_EMAIL_SERVER_USER=apikey
CONTACT_FORM_EMAIL_SERVER_PASSWORD=your_sendgrid_api_key
EVENT_SIGNUP_EMAIL_SERVER_USER=apikey
EVENT_SIGNUP_EMAIL_SERVER_PASSWORD=your_sendgrid_api_key
```

### Mailgun

```env
EMAIL_SERVER_HOST=smtp.mailgun.org
EMAIL_SERVER_PORT=587
CONTACT_FORM_EMAIL_SERVER_USER=postmaster@your-domain.mailgun.org
CONTACT_FORM_EMAIL_SERVER_PASSWORD=your_mailgun_smtp_password
EVENT_SIGNUP_EMAIL_SERVER_USER=postmaster@your-domain.mailgun.org
EVENT_SIGNUP_EMAIL_SERVER_PASSWORD=your_mailgun_smtp_password
```

---

## Database Management

### View Database in Browser

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`.

### Reset Database

```bash
npx prisma migrate reset
```

**⚠️ Warning**: This will delete all data!

### Create a New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

---

## Gallery Setup

To add events to the gallery:

1. Create a folder in `public/images/Gallery/`
2. Name it using this format: `EventName_Location_MonthYear`
   - Example: `Summit_Brussels_March 2024`
   - Example: `Workshop_Vienna_2024`
3. Add your images (JPG, PNG, JPEG, WebP) to the folder
4. The gallery will automatically detect and display them

---

## Translation Management

### Admin Translation Editor

As an admin, you can edit translations at:
- `/admin/translations` - Full access to all languages
- `/admin/translations/export` - Export translations from database to JSON files
- `/admin/translations/database` - Database management tools
- `/admin/translations/clean` - Clean up unused translations

### Automated Translation Script

To automatically translate content to all supported languages:

```bash
# Install Python dependencies
pip install torch transformers deep-translator spacy python-dotenv asyncpg

# Download spacy model
python -m spacy download en_core_web_sm

# Run the translation script
python scripts/translate_and_seed.py
```

This will use AI models to translate your English content to all supported languages.

---

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Make sure your database is running
- Check firewall settings if using a remote database

### Email Not Sending

- Test your SMTP credentials with a tool like Telnet
- Check spam folder
- Verify TLS/SSL settings
- Enable "Less secure apps" or use App Passwords for Gmail

### Upload Issues

- Verify your UploadThing credentials
- Check file size limits (default: 4MB)
- Ensure proper internet connection

### Admin Panel Not Showing

- Make sure you've set the `role: admin` in Clerk public metadata
- Clear browser cache and cookies
- Sign out and sign in again

---

## Production Deployment

See the [README.md](README.md#deployment) for detailed deployment instructions.

### Quick Checklist

- [ ] Set up production database (Neon, Supabase, etc.)
- [ ] Configure all environment variables in your hosting platform
- [ ] Run `npx prisma migrate deploy`
- [ ] Set up Clerk production instance
- [ ] Set up UploadThing production app
- [ ] Configure SMTP for production
- [ ] Test all features (auth, events, contact form, uploads)

---

## Need Help?

- Check the [README.md](README.md) for more detailed documentation
- Review [Translation System Documentation](README-TRANSLATIONS.md)
- Contact the EuropeTalks team through the website

---

**Happy coding! 🚀**
