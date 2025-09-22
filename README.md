# 🤖 Aria — AI Chatbot App

A modern, minimalistic chatbot application built with **Next.js** and **TypeScript**.  
Aria provides a smooth conversational interface powered by **Mistral API** and a **Supabase** database.

---

## 🚀 Live Demo

👉 [https://chat-with-aria.vercel.app](https://chat-with-aria.vercel.app)

---

## ✨ Features

- 💬 AI-powered chat using the **Mistral API**  
- 🔐 Authentication with **NextAuth.js** and **Google OAuth**  
- 🛡️ Input validation with **Zod** and **sanitize-html** for secure user input  
- 🗄️ **Supabase** for database, authentication persistence, and conversation storage  
- ⚡ Fast performance powered by Next.js  
- 🎨 Responsive design for desktop and mobile  
- 🔄 Automatic UI updates with Next.js app router  
- 📱 Deployed on Vercel for instant hosting  

---

## 🛠️ Tech Stack

- **Next.js** – React framework for server-side rendering and app routing  
- **TypeScript** – Type-safe JavaScript development  
- **Mistral API** – Natural language understanding and AI-generated responses  
- **NextAuth.js** – Authentication with Google OAuth integration  
- **Supabase** – PostgreSQL database, authentication, and real-time APIs  
- **Zod** – Type-safe schema validation  
- **sanitize-html** – Prevent XSS attacks from user input  
- **Tailwind CSS** – Utility-first styling  
- **Vercel** – Deployment and hosting platform  

---

## ⚙️ Local Setup

1. **Clone the repository**  
```
git clone https://github.com/JordanDonguy/aria.git
cd aria
```

2. **Install dependencies**
```
npm install
```

3. **Create .env.local from .env.example**
```
cp .env.example .env.local
```
- Fill in your Mistral API key
- Fill in your own Supabase URL & service role key (or run Supabase locally with migrations)
- Fill in NextAuth secret and optional Google OAuth credentials

4. **Set up Supabase (local or cloud)**
- Option 1: Use your own Supabase project
  - Create a free project at supabase.com
  - Apply migrations from the supabase/migrations/ folder:
  ```
  npx supabase db reset
  ```

- Option 2: Use Supabase local emulator
```
npx supabase start
npx supabase db reset
```

5. **Run the development server**
```
npm run dev
```
Open http://localhost:3000 to see your app in action.

-> Note: you can also visit live deployed version here: [https://chat-with-aria.vercel.app](https://chat-with-aria.vercel.app).


## 📝 Testing the AI
1. Log in with your Google account (or test credentials if provided).
2. Type a message in the chat input box and hit Send.
3. The AI powered by Mistral API will generate a response in real-time.


## ⚠️ Known Issues / Notes
- The Mistral API may occasionally return **429 (Too Many Requests)** errors.  
- This is a limitation on the API side and not related to the app itself.  
- If this occurs, simply wait a few seconds and try sending the message again.

## 📄 License
This project is for educational and portfolio purposes only.
Not licensed for reuse or redistribution.

## 👤 Author
Developed by Jordan Donguy