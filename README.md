# ☁️ StorageFile — Secure Cloud File Management Platform

**StorageFile** is a modern web application designed to securely store, manage, and share files using a role-based multi-space architecture and hybrid encryption methods. Built with the MERN stack, it enables users and organizations to collaborate safely in cloud environments without sacrificing usability or performance.

🔗 [Live Demo](https://bhunters.github.io/storageFile)

---

## 🚀 Features

### 🔐 Security First
- **JWT-based authentication** with optional **One-Time Password (OTP)** verification
- **Hybrid encryption**: RSA + AES for file protection
- **CORS** and **Helmet** for HTTP security headers
- **Role-based access control** within personal and organization spaces

### 📦 File Management
- Upload, preview, download, delete, copy, paste, move operations
- Archive file collections to `.zip`
- sharing files with multiple users
- favorite files function
- trash for restoring files or folders

### 🏢 Organizational Workspaces
- Separate personal and shared spaces
- Role hierarchy: `admin`, `member`, `viewer`
- Isolated environments per organization

### 🌐 Modern UI/UX
- Fully **responsive** and mobile-friendly design
- **Context menus**, **toasts**, **interactive forms**
- Smooth navigation between folders and spaces

### ☁️ Cloud Integration
- **Google Cloud Storage (GCS)** integration
- Persistent file access across sessions and devices

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (with Vite)
- **TypeScript**, **Zustand**, **Zod**, **Tailwind CSS**
- **Shadcn UI**: dialogs, dropdowns, avatars, menus
- **React Hook Form**, **Framer Motion**

### Backend
- **Node.js**, **Express.js**
- **MongoDB** (with Mongoose)
- **JWT**, **OTP (One-Time Password)** support
- **Crypto (RSA & AES)**, **CORS**, **Helmet**, **Multer**
- **Archiver** for zip file packaging

---

## Requirements

To run this project locally, you will need:

- Node.js v14 or higher
- npm or yarn

## Installation and Running

1. Clone the repository:

   ```bash
   git clone https://github.com/bhunters/storageFile
   cd storageFile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the project:

   ```bash
   npm start
   ```

   Open your browser and go to http://localhost:5173 to view your application.

## Authors

Developed by Volodymyr Novikov. You can reach me via:

Email:
- volodymyr.novikovv@gmail.com

Linkedin: 
- https://www.linkedin.com/in/volodymyrnovikovv/
