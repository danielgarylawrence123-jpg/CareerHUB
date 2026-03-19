# Career Hub

Your personal AI-powered job application tracker with separate accounts per user.

## File Structure

```
career-hub/
│
├── index.html              ← Main HTML (structure only, no logic)
│
├── css/
│   └── style.css           ← All styles and design
│
├── js/
│   ├── supabase-client.js  ← Supabase connection (URL + Key live here)
│   ├── auth.js             ← Login, signup, signout, profile load/save
│   ├── dashboard.js        ← Job tracker (save, edit, delete, stats)
│   ├── analyze.js          ← AI job analysis (match score, resume, cover letter)
│   ├── emails.js           ← Email template generator
│   └── app.js              ← Shared state, navigation, utilities
│
└── README.md               ← This file
```

## How to Edit Things

| I want to change...         | Edit this file              |
|-----------------------------|-----------------------------|
| Colors / fonts / layout     | `css/style.css`             |
| Login or signup behavior    | `js/auth.js`                |
| Job tracker / dashboard     | `js/dashboard.js`           |
| AI analysis prompts         | `js/analyze.js`             |
| Email templates             | `js/emails.js`              |
| Navigation / page structure | `js/app.js`                 |
| Page layout / HTML          | `index.html`                |
| Supabase URL or key         | `js/supabase-client.js`     |

## Deploying to GitHub Pages

1. Create a new GitHub repo called `career-hub` (set to Public)
2. Upload ALL files keeping the folder structure intact:
   - `index.html` goes in the root
   - `css/style.css` goes in a `css` folder
   - All `.js` files go in a `js` folder
3. Go to repo **Settings → Pages**
4. Set Source to **Deploy from a branch → main → / (root)**
5. Save — your site will be live at:
   `https://yourusername.github.io/career-hub`

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Auth + Database**: Supabase (free tier)
- **AI**: Claude (Anthropic) or ChatGPT (OpenAI) — user's choice
- **Hosting**: GitHub Pages (free)

## Supabase Tables

```sql
profiles  — stores each user's API key, AI provider, and resume
jobs      — stores each user's job applications (row-level security keeps data separate)
```
