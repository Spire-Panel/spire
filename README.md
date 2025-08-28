<div align="center">
  <img src="public/assets/logo.png" alt="Spire Logo" width="200" style="border-radius: 50%; box-shadow: 0 0 20px rgba(88, 166, 255, 0.5);"/>
  <h1>Spire</h1>
  <h3>Minecraft Server Management Platform</h3>
  
  <div class="header-badges">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&color=blueviolet">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white">
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
    <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="Clerk" src="https://img.shields.io/badge/Clerk-000?style=for-the-badge&logo=clerk&logoColor=white">
  </div>
</div>

## 🌐 System Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'dark': '#0d1117', 'primaryColor': '#0d1117', 'primaryTextColor': '#e1e4e8', 'primaryBorderColor': '#30363d', 'lineColor': '#30363d', 'secondaryColor': '#0d1117', 'tertiaryColor': '#0d1117' } }}%%
graph TD
    %% Main Components
    A[Spire Web Panel] -->|HTTPS/2| B[Next.js API Routes]
    B --> C[(MongoDB Atlas\nCloud Database)]

    %% Authentication
    A -->|OAuth 2.0| D[Clerk Auth]
    D -->|JWT| B

    %% Glide Daemons
    B -->|REST API| E[Glide Daemon 1\nNode 1]
    B -->|REST API| F[Glide Daemon 2\nNode 2]
    B -->|REST API| G[Glide Daemon N\nNode N]

    %% Docker Containers
    E -->|Manages| H[Minecraft Server 1\nDocker Container]
    E -->|Manages| I[Minecraft Server 2\nDocker Container]
    F -->|Manages| J[Minecraft Server 3\nDocker Container]
    G -->|Manages| K[Minecraft Server N\nDocker Container]

    %% Styling
    classDef panel fill:#1f6feb,color:white,stroke:#1f6feb,stroke-width:2px
    classDef api fill:#6e40c9,color:white,stroke:#6e40c9,stroke-width:2px
    classDef db fill:#2ea043,color:white,stroke:#2ea043,stroke-width:2px
    classDef auth fill:#db61a2,color:white,stroke:#db61a2,stroke-width:2px
    classDef daemon fill:#e3b341,color:black,stroke:#e3b341,stroke-width:2px
    classDef server fill:#f85149,color:white,stroke:#f85149,stroke-width:2px

    class A panel
    class B api
    class C db
    class D auth
    class E,F,G daemon
    class H,I,J,K server
```

## 🚀 Features

<div class="feature-grid">
  <div class="feature-card">
    <h3>🚀 Server Management</h3>
    <ul>
      <li>Multi-Node Deployment</li>
      <li>Docker Containerization</li>
      <li>One-Click Operations</li>
      <li>Resource Allocation</li>
      <li>Automated Backups</li>
    </ul>
  </div>
  
  <div class="feature-card">
    <h3>📊 Monitoring</h3>
    <ul>
      <li>Real-time Metrics</li>
      <li>Player Tracking</li>
      <li>Performance Analytics</li>
      <li>Automated Alerts</li>
      <li>Log Viewer</li>
    </ul>
  </div>
  
  <div class="feature-card">
    <h3>🔐 Security</h3>
    <ul>
      <li>Role-Based Access</li>
      <li>Clerk Authentication</li>
      <li>Activity Logs</li>
      <li>IP Whitelisting</li>
      <li>SSL Encryption</li>
    </ul>
  </div>
</div>

## 🛠️ Technical Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **UI**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [React Query](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide Icons](https://lucide.dev/)

### Backend

- **Runtime**: [Node.js 18+](https://nodejs.org/)
- **API**: [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication**: [Clerk](https://clerk.com/)
- **Real-time**: [Socket.IO](https://socket.io/)

### Infrastructure

- **Containerization**: [Docker](https://www.docker.com/)
- **Orchestration**: [Glide Daemon](https://github.com/your-org/glide)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **Hosting**: [Vercel](https://vercel.com/) (Frontend), [Railway](https://railway.app/)/[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Backend)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB 6.0+
- Docker 24.0+
- pnpm 8.x

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/spire.git
   cd spire
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Access the dashboard**

   Open [http://localhost:3000](http://localhost:3000) in your browser

<div class="note">
  <p><strong>Note:</strong> Make sure you have all the required environment variables set in your <code>.env</code> file before starting the application.</p>
</div>

## 🏗️ Project Structure

```
spire/
├── public/            # Static assets and media
│   └── assets/        # Images, fonts, etc.
├── src/
│   ├── actions/       # Server actions and API handlers
│   │   ├── clerk.actions.ts   # Auth-related actions
│   │   ├── db.actions.ts      # Database operations
│   │   └── roles.actions.ts   # Role management
│   ├── app/           # Next.js app router
│   │   ├── api/       # API routes
│   │   ├── (auth)/    # Authentication pages
│   │   ├── dashboard/ # Dashboard pages
│   │   └── layout.tsx # Root layout
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # Base UI components
│   │   ├── dashboard/ # Dashboard components
│   │   ├── files/     # File management components
│   │   ├── nodes/     # Node management components
│   │   ├── onboarding/ # Onboarding components
│   │   ├── server/    # Server management components
│   │   └── settings/    # Settings components
│   ├── config/        # Environment configuration
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Shared utilities
│   │   ├── models/        # Database models
│   │   ├── db.ts          # Database connection
│   │   ├── api-utils.ts   # API utilities
│   │   ├── middlewares.ts # API middlewares
│   │   ├── Roles.ts       # Role management
│   │   └── utils.ts       # Helper functions
│   └── types/         # TypeScript type definitions
├── .env.example       # Example environment variables
├── package.json       # Project dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Report bugs** - Open an issue with detailed information
2. **Suggest features** - Share your ideas for improvements
3. **Submit pull requests** - Help us improve the codebase

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

<div class="warning">
  <p><strong>Important:</strong> Please make sure to write tests for your changes and ensure all tests pass before submitting a PR.</p>
</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Clerk](https://clerk.com/) - Authentication and User Management
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) - Data synchronization for React

---

<div class="footer">
  <p>Made with ❤️ by the Spire Team</p>
  
  <div class="footer-links">
    <a href="https://github.com/spire-panel/spire">
      <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
      </svg>
      Spire GitHub
    </a>
    <a href="https://discord.gg/spire-panel">
      <svg height="16" viewBox="0 0 127.14 96.36" width="16" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"></path>
      </svg>
      Discord
    </a>
    <a href="https://github.com/spire-panel/glide">
      <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
      </svg>
      Glide Github
    </a>
  </div>
  
  <p style="margin-top: 2rem; font-size: 0.9em; color: #6e7681;">
    &copy; 2025 Spire. All rights reserved.
  </p>
</div>
