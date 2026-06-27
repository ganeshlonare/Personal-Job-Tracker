<h1 align="center">
  🎯 Personal Job Tracker
</h1>

<p align="center">
  <strong>A full-stack, self-hosted job search management platform built for developers who take their careers seriously.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-docker-deployment">Docker</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</p>

---

## 📖 Overview

**Personal Job Tracker** is a comprehensive, production-ready career management system designed to replace scattered spreadsheets and sticky notes with a unified, intelligent dashboard. It goes far beyond simply tracking job applications — it helps you manage every aspect of your job search journey.

From monitoring your LeetCode grind and interview prep to logging cold emails, journaling daily reflections, and tracking your GitHub activity — this platform gives you complete visibility and control over your career growth.

> **Built by a developer, for developers.** Every feature was designed to reflect real-world job hunting workflows.

---

## ✨ Features

### 🗂️ Job Application Management
- Track applications with full status lifecycle — Applied → Screening → Interview → Offer → Rejected
- Store company details, job descriptions, salary expectations, and contact info
- Associate interviews and documents with each application

### 🏢 Company Research Hub
- Maintain a curated database of target companies
- Record company culture notes, tech stack, size, and Glassdoor ratings
- Link companies to your active applications

### 🧠 Interview Preparation
- Log mock interviews and real interview rounds
- Track interview types: Phone, Technical, HR, System Design, Behavioral
- Save interviewer notes and feedback per round

### 💡 LeetCode Tracker
- Log solved problems with difficulty (Easy / Medium / Hard)
- Track patterns, topics, and time spent per problem
- Integrated into the daily scoring system

### 📅 Today's Dashboard
- See everything important at a glance: today's tasks, applications, interviews, and goals
- Daily productivity score with gamified levels (Beginning → Legendary 🏆)
- Target vs. actual tracking for applications, leetcode, and study hours

### 📊 Analytics & Insights
- Visual breakdowns of application funnel, interview conversion rates
- Weekly and monthly productivity charts powered by Recharts
- Streak tracking for consistent daily activity

### 🎯 Goals & Milestones
- Set weekly/monthly job search goals
- Track progress with visual indicators
- Celebrate milestones with achievements

### 🏆 Achievements System
- Earn badges for consistent activity streaks
- Milestone rewards for applications sent, problems solved, and more

### 📬 Cold Mail Tracker
- Log cold outreach emails with status (Sent / Replied / No Response)
- Built-in cold mail templates for faster outreach
- Track open and reply rates

### 📁 Document Management
- Store and organize resumes, cover letters, and portfolio links
- Associate documents with specific applications

### 📓 Daily Journal
- Write daily reflections and learnings
- Helps maintain mental health and growth mindset during the job search

### 📚 Study Sessions
- Log study sessions with topics and duration
- Integrated into daily scoring for comprehensive productivity tracking

### 🗓️ Calendar View
- Visual calendar of interviews, application deadlines, and follow-up reminders
- Event color-coding by type

### 🔗 GitHub Integration
- Pull in your GitHub activity to showcase coding consistency
- Correlate coding activity with application outcomes

### ⏱️ Career Timeline
- Visual timeline of your entire job search journey
- See the full arc from first application to final offer

### 👤 Profile & Settings
- Manage personal profile and preferences
- Dark mode support with `next-themes`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Frontend** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) (Accessible primitives) |
| **Animations** | [Framer Motion](https://www.framer-motion.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (JWT strategy) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Export** | [SheetJS (xlsx)](https://sheetjs.com/) |
| **AI (Optional)** | [Google Gemini API](https://ai.google.dev/) |
| **Containerization** | [Docker](https://www.docker.com/) + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 20.x` ([Download](https://nodejs.org/))
- **npm** `>= 10.x` (bundled with Node.js)
- **MongoDB** `>= 6.x` — either [locally](https://www.mongodb.com/docs/manual/installation/) or via [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/personal_tracker.git
cd personal_tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See the [Environment Variables](#-environment-variables) section for a full description of each variable.

### 4. Start MongoDB (if running locally)

```bash
# Start MongoDB using the system service
sudo systemctl start mongod

# Or run MongoDB in Docker (recommended)
docker run -d -p 27017:27017 --name mongo mongo:6
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page on first visit.

### 6. Register Your Account

Navigate to [http://localhost:3000/register](http://localhost:3000/register) to create your account. All data is stored privately in your own MongoDB instance.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root. Reference `.env.example` as a template.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string. Example: `mongodb://localhost:27017/jobos` |
| `NEXTAUTH_SECRET` | ✅ Yes | A strong random secret for JWT signing. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ Yes | The base URL of your app. Example: `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Public-facing app URL (used in client-side code). Example: `http://localhost:3000` |
| `GEMINI_API_KEY` | ⚙️ Optional | Google Gemini API key for AI-powered features. Get one at [ai.google.dev](https://ai.google.dev/) |

**Example `.env.local`:**
```env
MONGODB_URI=mongodb://localhost:27017/jobos
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=
```

> ⚠️ **Never commit `.env.local` to version control.** It is already excluded via `.gitignore`.

---

## 🐳 Docker Deployment

The project ships with a production-ready multi-stage `Dockerfile` and a `docker-compose.yml` that runs the app alongside a MongoDB container.

### Option A: Docker Compose (Recommended)

This is the easiest way to run the full stack locally or on a server.

**1. Configure your `.env.local`:**
```bash
cp .env.example .env.local
# Edit .env.local with your NEXTAUTH_SECRET and other values
```

**2. Build and start all services:**
```bash
docker compose up --build -d
```

**3. Access the app:**

Open [http://localhost:3000](http://localhost:3000).

**4. Stop all services:**
```bash
docker compose down
```

**5. Stop and remove all data:**
```bash
docker compose down -v
```

---

### Option B: Build Docker Image Manually

```bash
docker build \
  --build-arg MONGODB_URI="mongodb://your-mongo-host:27017/jobos" \
  --build-arg NEXTAUTH_URL="http://your-domain.com" \
  --build-arg NEXTAUTH_SECRET="your-secret" \
  --build-arg NEXT_PUBLIC_APP_URL="http://your-domain.com" \
  -t personal_tracker:latest .

docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-mongo-host:27017/jobos" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://your-domain.com" \
  -e NEXT_PUBLIC_APP_URL="http://your-domain.com" \
  personal_tracker:latest
```

---

### Option C: Production Build (No Docker)

```bash
npm run build
npm start
```

The app will run on port `3000` by default. Use a reverse proxy like **Nginx** or **Caddy** in front of it for HTTPS.

---

## 📁 Project Structure

```
personal_tracker/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth pages (login, register)
│   │   ├── (dashboard)/            # Protected dashboard pages
│   │   │   ├── achievements/       # Achievements & badges
│   │   │   ├── analytics/          # Charts & insights
│   │   │   ├── applications/       # Job application tracking
│   │   │   ├── calendar/           # Event calendar
│   │   │   ├── cold-mails/         # Cold outreach tracker
│   │   │   ├── companies/          # Company research
│   │   │   ├── dashboard/          # Main overview dashboard
│   │   │   ├── documents/          # Resume & document manager
│   │   │   ├── github/             # GitHub activity integration
│   │   │   ├── goals/              # Goal setting & tracking
│   │   │   ├── interviews/         # Interview log
│   │   │   ├── journal/            # Daily journal
│   │   │   ├── leetcode/           # LeetCode problem tracker
│   │   │   ├── projects/           # Personal project log
│   │   │   ├── resumes/            # Resume versions
│   │   │   ├── settings/           # App settings
│   │   │   ├── study/              # Study session tracker
│   │   │   ├── timeline/           # Career timeline
│   │   │   └── today/              # Today's focus view
│   │   └── api/                    # API Route Handlers
│   ├── components/                 # Reusable React components
│   │   ├── achievements/
│   │   ├── analytics/
│   │   ├── applications/
│   │   ├── calendar/
│   │   ├── cold-mails/
│   │   ├── dashboard/
│   │   ├── github/
│   │   ├── goals/
│   │   ├── interviews/
│   │   ├── journal/
│   │   ├── layout/                 # Sidebar, Navbar, Shell
│   │   ├── leetcode/
│   │   ├── projects/
│   │   ├── resumes/
│   │   ├── settings/
│   │   ├── shared/                 # Common UI elements
│   │   ├── study/
│   │   ├── timeline/
│   │   └── today/
│   ├── actions/                    # Next.js Server Actions
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Core utilities & configuration
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── auth.config.ts          # Auth strategy (JWT)
│   │   ├── db.ts                   # MongoDB connection pool
│   │   ├── scoring.ts              # Daily productivity score engine
│   │   ├── constants.ts            # App-wide constants & score points
│   │   ├── achievements.ts         # Achievement unlock logic
│   │   └── utils.ts                # Shared helpers
│   ├── models/                     # Mongoose data models
│   │   ├── User.ts
│   │   ├── Application.ts
│   │   ├── Company.ts
│   │   ├── Interview.ts
│   │   ├── Leetcode.ts
│   │   ├── Project.ts
│   │   ├── Goal.ts
│   │   ├── Journal.ts
│   │   ├── StudySession.ts
│   │   ├── ColdMail.ts
│   │   ├── Achievement.ts
│   │   ├── CalendarEvent.ts
│   │   ├── Document.ts
│   │   ├── Resume.ts
│   │   ├── Task.ts
│   │   ├── DailyScore.ts
│   │   ├── DailyTarget.ts
│   │   └── Report.ts
│   ├── stores/                     # Zustand global state stores
│   ├── types/                      # TypeScript type definitions
│   ├── validators/                 # Zod validation schemas
│   └── middleware.ts               # Auth-based route protection
├── public/                         # Static assets
├── scripts/                        # Utility scripts
├── Dockerfile                      # Multi-stage production Docker image
├── docker-compose.yml              # App + MongoDB orchestration
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── eslint.config.mjs               # ESLint configuration
```

---

## 🎮 Daily Scoring System

Personal Job Tracker includes a **gamified daily scoring engine** to keep you motivated during your job search.

Each activity type awards points, and your total daily score maps to a performance level:

| Score | Level | Emoji |
|---|---|---|
| 0 – 24 | Begin Your Day | ☀️ |
| 25 – 49 | Getting Started | 🌱 |
| 50 – 74 | Good | 💪 |
| 75 – 99 | Great | 🔥 |
| 100 – 149 | Outstanding | ⭐ |
| 150+ | Legendary | 🏆 |

Activities tracked: Job Applications, LeetCode Problems (Easy/Medium/Hard), Study Hours, Project Hours, Interviews, and Networking.

---

## 🔒 Security

- **Authentication** is handled by NextAuth.js v5 with a **JWT session strategy** — no server-side session storage needed.
- All protected routes are enforced at the **middleware level** before any page renders.
- **Passwords** are hashed using `bcryptjs` before being stored in the database.
- Environment secrets are never exposed to the client.
- MongoDB connection strings and API keys are server-side only.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on `http://localhost:3000` |
| `npm run build` | Build the production-optimized bundle |
| `npm start` | Start the production server (requires `npm run build` first) |
| `npm run lint` | Run ESLint across the project |

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Ganesh Lonare**

- GitHub: [@ganesh-lonare](https://github.com/ganesh-lonare)

---

<p align="center">
  Built with ❤️ to make the job search less painful and more productive.
</p>
