# 🍰 RPL Production App

A simple and efficient web application built with **React + Vite**, designed to support production workflow management.  
This project provides a clean and minimal setup using Vite’s fast development server and React’s component-based architecture.

---

## 🚀 Features
- ⚡ Fast development with **Vite**
- ⚛️ Modern UI built with **React**
- 🔄 Hot Module Replacement (HMR)
- ✅ Pre-configured **ESLint** for code quality
- 💻 Easy to extend and deploy

---

## 🧩 Tech Stack
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)
- [Node.js](https://nodejs.org/)

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Aira-salsa-k/rpl_production_app.git
```

### 2️⃣ Navigate into the Project Folder
```bash
cd rpl_production_app
```

### 3️⃣ Install Dependencies
Make sure you have **Node.js v18 or later** installed.
```bash
npm install
```

### 4️⃣ Run the Development Server
```bash
npm run dev
```

After running the command, open the link shown in your terminal (usually):

👉 [http://localhost:5173/](http://localhost:5173/)

---

## 🏗️ Build for Production

To build an optimized version of the app:
```bash
npm run build
```

The production-ready files will be generated inside the **`dist/`** folder.

To preview the build locally:
```bash
npm run preview
```

---

## 📁 Project Structure
```
rpl_production_app/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .eslintrc.cjs        # ESLint configuration
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies & scripts
└── README.md            # Project documentation
```

---

## 🧠 Notes
If you want to enable the new **React Compiler**, follow the official guide:  
👉 [React Compiler Installation Guide](https://react.dev/learn/react-compiler/installation)

---

## 👩‍💻 Author
**Aira Salsa Kusumadewi**  
🎨 [Waterz Production](https://github.com/Aira-salsa-k)

---

## 📜 License
This project is licensed under the **MIT License** — feel free to use and modify it.

---

## 📘 React + Vite Base Info

This project was bootstrapped with the official [Vite React Template](https://vitejs.dev/).  
It includes a minimal setup to get React working in Vite with HMR and ESLint.

### Available Plugins
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) (uses **Babel** or **oxc**)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) (uses **SWC** for Fast Refresh)

### Expanding ESLint
For production-grade applications, we recommend using **TypeScript** with type-aware lint rules.  
Learn more here:  
👉 [TypeScript ESLint Guide](https://typescript-eslint.io)


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
