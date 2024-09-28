# SellScaleHood Frontend

This is the frontend of **SellScaleHood**, a stock trading web application built using **React**, **Vite**, and **TypeScript** with **TailwindCSS** for styling.

## Tech Stack

- **React** (with TypeScript)
- **Vite** (for fast development)
- **TailwindCSS** (for styling)
- **Radix UI** and **Material UI** (for accessible UI components)

## Prerequisites

- **Node.js** (v14.x or later)
- **npm** or **yarn**

## Setup

1. Clone the frontend repository:

    ```bash
    git clone https://github.com/akshat235/SSH_UI.git
    ```

    cd into the folder

2. Install the dependencies using npm or yarn:

   - For **npm**:
     ```bash
     npm install
     ```
   - For **yarn**:
     ```bash
     yarn install
     ```

3. Create a `.env` file in the `frontend` directory with the following content:

    ```bash
    SERVER_BASE_URL=http://127.0.0.1:5000
    ```

   This specifies the base URL of your backend API.

  !!!You might need to change the port number if 5000 is not available on your device


4. Start the development server:

   - For **npm**:
     ```bash
     npm run dev
     ```
   - For **yarn**:
     ```bash
     yarn dev
     ```

   The development server will be running at `http://localhost:4200`.

## Available Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the app for production.
- `npm run preview`: Preview the production build.

## Folder Structure

- **src/**: Contains the main source code for the frontend.
  - **components/**: Reusable UI components.
  - **pages/**: Different pages of the app.
  - **services/**: API service functions (e.g., Axios requests).
  - **assets/**: Static assets like images or fonts.
  - **styles/**: Global CSS or Tailwind configuration.



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
