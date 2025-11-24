# Dashboard Budaya Risiko

A modern dashboard application built with React, Vite, and MSSQL, designed to provide Power BI-like visualizations with a custom admin panel for data management.

## 🚀 Features

- **Power BI-Like Dashboard**: Modern, responsive dashboard with interactive charts and statistics
- **Admin Panel**: Complete CRUD operations for data management
- **Real-time Data Visualization**: Bar Charts, Line Charts, Pie Charts, Statistics Cards
- **MSSQL Integration**: Direct connection to Microsoft SQL Server
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Microsoft SQL Server
- Git

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_SERVER=your_server
   DB_NAME=your_database
   ```

3. **Update database queries**
   Edit `server/index.ts` and replace `your_table` with your actual table name.

## 🚀 Running the Application

**Start both frontend and backend:**
```bash
npm run dev:all
```

**Or run separately:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
src/
├── components/charts/    # Chart components
├── components/layout/    # Layout components
├── pages/               # Dashboard & Admin pages
├── services/            # API services
├── store/              # State management
└── types/              # TypeScript types

server/
└── index.ts            # Express backend
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Frontend dev server |
| `npm run dev:server` | Backend dev server |
| `npm run dev:all` | Both servers |
| `npm run build` | Build frontend |
| `npm run build:server` | Build backend |

## �� Features

### Dashboard
- Statistics cards with trends
- Interactive charts (Bar, Line, Pie)
- Responsive grid layout

### Admin Panel
- CRUD operations
- Data table with pagination
- Form validation

## 🔌 API Endpoints

- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/charts/:type` - Chart data
- `GET /api/admin/data` - Get all records
- `POST /api/admin/data` - Create record
- `PUT /api/admin/data/:id` - Update record
- `DELETE /api/admin/data/:id` - Delete record

## 🛡️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `DB_SERVER` | Server address | localhost |
| `DB_NAME` | Database name | - |
| `PORT` | Backend port | 3001 |

## 🐛 Troubleshooting

**Database Connection:**
- Verify credentials in `.env`
- Check SQL Server remote connections
- Verify firewall settings

**Port in Use:**
```bash
lsof -ti:3001 | xargs kill -9
```

## 📝 Next Steps

1. Update database table names in `server/index.ts`
2. Configure your `.env` file
3. Create database schema
4. Customize dashboard charts
5. Add authentication (optional)

Built with ❤️ using React, Vite, TypeScript, and MSSQL
