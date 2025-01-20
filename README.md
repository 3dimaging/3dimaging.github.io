# Personal Website with Analytics

A modern personal website with built-in analytics tracking system.

## Features

- Responsive design
- Project portfolio with filtering
- Mobile-friendly interface
- Built-in analytics system
- Visitor tracking
- User behavior analysis

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python Flask
- Database: PostgreSQL (Production), SQLite (Development)
- Hosting: GitHub Pages (Frontend), Vercel (Backend)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-website.git
cd personal-website
```

2. Set up Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
python server.py
```

5. Open index.html in your browser or use a local server:
```bash
python -m http.server 8000
```

## Deployment

### Frontend (GitHub Pages)

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/personal-website.git
git push -u origin main
```

3. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

### Backend (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel login
vercel
```

3. Set up environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `FLASK_ENV`: production

4. Configure your database:
   - Create a PostgreSQL database (recommended providers: Supabase, Neon)
   - Add the connection string to Vercel environment variables

5. Update the API URL in script.js with your Vercel deployment URL

## Analytics Dashboard

Access your analytics at: `https://your-vercel-url/api/analytics`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - feel free to use this project as a template for your personal website!
