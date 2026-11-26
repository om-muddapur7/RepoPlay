
<div align="center">

# ▶️ RepoPlay

### Turn GitHub Repositories into Interactive Experiences

Discover, preview, and interact with GitHub projects directly in your browser — without cloning repositories, installing dependencies, or setting up a local environment.

[Report Bug](https://github.com/om-muddapur7/RepoPlay/issues) • [Request Feature](https://github.com/om-muddapur7/RepoPlay/issues) • [Portfolio](https://om-portfolio-plum.vercel.app/)

</div>

---

## 📖 Overview

RepoPlay is a full-stack SaaS platform that transforms compatible public GitHub repositories into interactive browser-based previews. It allows developers, recruiters, students, and non-technical users to explore software projects without the complexity of local development environments.

Simply paste a GitHub repository URL, and RepoPlay automatically detects compatible frontend projects, builds their source code, or opens an existing Vercel deployment.

Designed with security, accessibility, and developer experience in mind, RepoPlay combines Next.js, TypeScript, esbuild WebAssembly, sandboxed iframes, and Clerk to deliver an intuitive project exploration experience.

---

## ✨ Features

### 🚀 Repository Preview Engine

- 🔗 **GitHub URL Integration** – Preview compatible public GitHub repositories using their URLs.
- ⚡ **Browser-Based Execution** – Explore supported projects without local installation.
- 🌐 **Static Website Support** – Run HTML, CSS, and JavaScript websites.
- ⚛️ **React Project Support** – Preview compatible Vite and Create React App projects.
- 📦 **Frontend Extraction** – Detect and preview compatible frontend folders within full-stack repositories.
- ☁️ **Deployment Detection** – Automatically open supported existing Vercel deployments.
- 🛠️ **Source Code Bundling** – Bundle compatible frontend source code using esbuild WebAssembly.
- ⏳ **Temporary Preview Sessions** – Free and Basic previews expire after 10 minutes. Premium previews have no time limit.

---

### 👤 User Features

- 🔐 Secure authentication with Clerk
- 📊 Personal workspace dashboard
- 📚 Private project gallery on Basic and Premium
- 🕘 Previously rendered project history on Basic and Premium
- 🔄 Reopen saved projects in fresh preview sessions on Basic and Premium
- 🔍 Explore curated sample projects
- 👤 Account and subscription management
- 🌙 Light and dark themes
- 📱 Fully responsive design
- 🎨 Modern and minimalist user interface

---

### 💎 Premium Features

- 🚀 Unlimited repository previews
- ⏳ No time limit per preview
- 🔍 Compatibility checks in standard and frontend-only modes
- 💳 Integrated subscription checkout
- 📋 Subscription and plan management

### Subscription Plans

| Feature | Free | Basic | Premium |
| --- | --- | --- | --- |
| Repository previews | 2 total | 20 total | Unlimited |
| Time per preview | 10 minutes | 10 minutes | No time limit |
| Sample project library | Included | Included | Included |
| Static and compatible React previews | Included | Included | Included |
| Compatibility checks | Standard | Standard | Standard and frontend-only |
| Private gallery and reopen saved projects | — | Included | Included |
| Frontend-only demos | — | Included | Included |

Current subscription prices and additional plan benefits are displayed through Clerk Billing.

---

## 🛠️ Tech Stack

### 🎨 Frontend

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

### ⚙️ Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js_API-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_REST_API-181717?style=for-the-badge&logo=github&logoColor=white" />
</p>

### 🔐 Authentication & Billing

<p>
  <img src="https://img.shields.io/badge/Clerk_Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk_Billing-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
</p>

### 📦 Preview Engine

<p>
  <img src="https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black" />
  <img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Sandboxed_Iframes-334155?style=for-the-badge" />
</p>

### ☁️ Deployment & Data Management

<p>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk_User_Metadata-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
</p>

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[User] --> B[Next.js Frontend]
    B --> C[Clerk Authentication]
    B --> D[Next.js API Routes]
    D --> E[Subscription & Usage Validation]
    E --> F[GitHub REST API]
    F --> G[Repository Analysis]
    G --> H{Preview Mode}
    H -->|Existing Deployment| I[Vercel Deployment]
    H -->|Static Website| J[Static Preview Engine]
    H -->|React Project| K[esbuild WebAssembly]
    J --> L[Sandboxed iframe]
    K --> L
    I --> M[Interactive Demo]
    L --> M
    M --> N[Private Project Gallery]
    N --> O[Clerk User Metadata]
```

---

## ⚡ How It Works

1. **Sign In** – Authenticate securely using Clerk.
2. **Submit Repository** – Paste a public GitHub repository URL into the workspace.
3. **Validate Access** – Verify the user's subscription and available preview allowance.
4. **Analyze Repository** – Fetch repository metadata and inspect frontend entry points.
5. **Select Preview Mode** – Detect an existing deployment, static website, or compatible React application.
6. **Generate Preview** – Create a signed temporary preview link and bundle compatible source code when required.
7. **Launch Interactive Demo** – Explore the project directly in the browser.
8. **Save Project** – Record successfully rendered projects in the user's private gallery.
9. **Reopen Anytime** – Generate a fresh session for previously saved projects.

Free and Basic previews expire after **10 minutes**. Premium previews have no time limit.

---

## 📂 Project Structure

```text
RepoPlay/
│
├── app/
│   ├── workspace/          # Repository previews and gallery
│   ├── plans/              # Subscription plans
│   ├── profile/            # User account settings
│   ├── api/                # Backend API route handlers
│   ├── temporary/          # Temporary demo viewer
│   └── static-preview/     # Static preview assets
│
├── components/             # Reusable UI components
│                           # Navigation, pricing, gallery
│
├── lib/                    # Core application logic
│                           # Repository source loading
│                           # Preview signing
│                           # Account and usage management
│
├── public/                 # Public assets
│
├── proxy.ts                # Clerk middleware
├── .env.example            # Environment variable template
└── README.md
```

---

## 📋 Supported Projects

| Project Type | Support |
|---|---|
| HTML, CSS & JavaScript | ✅ Supported |
| React + Vite | ✅ Compatible projects |
| Create React App | ✅ Compatible projects |
| Full-Stack Applications | ⚠️ Frontend-only preview |
| Existing Vercel Deployments | ✅ Supported deployments |
| Backend Server Execution | ❌ Not supported |
| Database Execution | ❌ Not supported |
| Private GitHub Repositories | ❌ Not supported |
| Server-Side Environment Variables | ❌ Not supported |

RepoPlay is primarily designed for frontend project exploration. Applications requiring backend servers, databases, private API keys, or unsupported build configurations may have limited functionality.

---

## ⚙️ Run Locally

Requires Node.js 20.9 or later, npm, and a Clerk application.

```bash
git clone https://github.com/om-muddapur7/RepoPlay.git
cd RepoPlay
npm ci
```

Copy `.env.example` to `.env.local`. Set the required values below.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key from your Clerk app |
| `CLERK_SECRET_KEY` | Server-side secret key from the same Clerk app |
| `PREVIEW_SIGNING_SECRET` | Random server-side secret of at least 32 bytes |
| `PAID_PLAN_SLUGS` | Optional comma-separated Clerk plan slugs. Defaults to `basic,premium` |

Generate a preview signing secret locally and paste the output into `.env.local`.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `.env.local` out of Git. Enable Google in your Clerk app if you want Google sign-in. Enable Clerk Billing and configure the matching user plans to test upgrades.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000/), sign in, and paste a public GitHub repository URL into **Workspace**.

---

## Open in RepoPlay

Add this badge to a project README. Replace the host with your RepoPlay deployment and replace `OWNER` and `REPO` with the source repository details.

```markdown
[![Open in RepoPlay](https://img.shields.io/badge/Open%20in-RepoPlay-2563eb)](https://YOUR-REPOPLAY-HOST/workspace?repo=https%3A%2F%2Fgithub.com%2FOWNER%2FREPO#preview)
```

The link pre-fills the workspace. Use **Check compatibility** for a report without consuming a preview, or **Create preview** to open a temporary demo.

## ☁️ Deploy on Vercel

Import the GitHub repository into Vercel with the **Next.js** preset. Add the required environment variables to the Production environment, then deploy. For a public release, use a Clerk production instance configured for the deployment domain. Subsequent pushes to the connected production branch can trigger new deployments.

---

## 📸 Screenshots

### Home Page

<img width="1842" height="795" alt="image" src="https://github.com/user-attachments/assets/ed4849f2-d5a5-4de4-a2f5-ad55c03259d9" />


### Workspace

<img width="1870" height="852" alt="image" src="https://github.com/user-attachments/assets/6368ead0-73a6-4287-8434-a77169be94ba" />


### Interactive Repository Preview

<img width="1895" height="851" alt="image" src="https://github.com/user-attachments/assets/c535e7cd-0d12-43e3-9ac3-34607c0287c5" />



---

## 📌 API Features

- GitHub Repository Metadata Retrieval
- Repository Source Code Fetching
- Frontend Entry Point Detection
- Existing Deployment Detection
- Temporary Preview Generation
- Signed Preview Token Validation
- Preview Expiration Management
- Subscription and Usage Validation
- User Project History Management
- Private Project Gallery Management

---

## 🔒 Authentication & Security

RepoPlay uses **Clerk Authentication** and signed preview tokens to manage secure access to application resources.

- Email and Password Authentication
- Google Authentication with Clerk configuration
- Protected Application Routes
- Secure User Session Management
- Subscription-Based Access Control
- Account-Specific Preview Tokens
- Time-Limited Preview Sessions
- Sandboxed iframe Rendering
- Private User Metadata Storage
- Server-Side Preview Validation

Temporary preview links are signed and validated before access is granted. Source-built frontend previews use sandboxed iframes to provide browser-level isolation.

---

## 💳 Subscription Management

RepoPlay integrates **Clerk Billing** to provide subscription-based access to repository previews.

- Free and Paid Subscription Plans
- Preview Usage Limits
- Integrated Subscription Checkout
- Paid Plan Access Validation
- User Subscription Management
- Dynamic Pricing Information

To enable subscription upgrades locally, configure Clerk Billing and create the corresponding plans in your Clerk dashboard.


---

## 🎯 Use Cases

### 👨‍💻 Developers

- Showcase projects without requiring local setup.
- Explore open-source frontend projects.
- Share interactive software demonstrations.

### 🧑‍💼 Recruiters

- Evaluate developer portfolios through working demonstrations.
- Explore projects without cloning repositories.
- Understand project functionality beyond source code.

### 🎓 Students

- Discover and explore open-source applications.
- Learn from existing frontend implementations.
- Showcase academic and personal projects.

### 🌍 Non-Technical Users

- Explore software projects without programming knowledge.
- Interact with applications directly in the browser.
- Discover what developers have built.

---

## 📈 Future Improvements

- 🤖 AI-Powered Repository Analysis
- 📝 Automatic Project Summarization
- 📦 Support for Additional Frontend Frameworks
- 🖥️ Cloud-Based Backend Execution
- 🐳 Docker-Based Isolated Environments
- 🔒 Private Repository Support
- 🌍 Public Community Project Gallery
- 📊 Project Analytics Dashboard
- ⭐ Project Ratings and Reviews
- 📁 GitHub Account Repository Integration
- 🔗 Shareable Project Collections
- 👥 Collaborative Developer Workspaces
- 🧩 Embeddable Project Previews

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create your feature branch.

```bash
git checkout -b feature/NewFeature
```

3. Commit your changes.

```bash
git commit -m "Add New Feature"
```

4. Push to your branch.

```bash
git push origin feature/NewFeature
```

5. Open a Pull Request.

If you encounter a preview-related issue, include the repository URL, preview mode, and the error displayed in the workspace.

---

## ⭐ Support

If you found RepoPlay useful, please consider giving it a ⭐ on GitHub.

Your support helps motivate future development and improvements.

---

## 👨‍💻 Author

**Om Muddapur**

- GitHub: https://github.com/om-muddapur7
- LinkedIn: https://linkedin.com/in/om-muddapur-aa56a525b
- Portfolio: https://om-portfolio-plum.vercel.app/
- X: https://x.com/Om7248

---

<div align="center">

### Stop Cloning. Start Exploring. ▶️

Made with ❤️ using Next.js, TypeScript, esbuild & Clerk

</div>
