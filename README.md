# 🍻 PARTY DRINKS TRACKER 🍹

The ultimate party companion that tracks who's drinking what and crowns the party champion! 👑 Watch as your friends compete for the top spot on the leaderboard while sharing their drinking adventures through tweets. 🏆

Made for me and my good friend's Daniel joint Birthday Party BBQ. 🎂 Got wasted because of it. 🥴 Recommended by Delft Nerds (allegedly). 🤓. Drinking isn't a Sprint it's a Marathon.

Vibe coded in 4hrs. ⏱️

## 🎉 Features

- **Real-time Leaderboard** 📊: See who's leading the pack with automatic updates every 5 seconds
- **Tweet Wall** 🐦: Share your drinking moments with the party crew
- **Drink Tracking** 🍺🍷🍸: Log beers, wines, cocktails, and even wins (if you're into that) 🚬
- **Projector Mode** 📽️: Display the leaderboard on a big screen for maximum competitive spirit

## 🔍 How to use

1.  Deploy 🚀
2.  Make users register with username pass image all required 📝
3.  Put `/projector` on a big screen 📺
4.  Profit 💰✨

## 🚀 Deployment

This app can be deployed in minutes on [Vercel](https://vercel.com) with [Supabase](https://supabase.com) as the DB. ⚡ (all free tiers btw)

### Prerequisites 📋

1. A Vercel account 🔼
2. A Supabase account 🗃️
3. A desire to party responsibly 🥳

### Steps 👣

1. Clone this repo 📂

   ```bash
   git clone https://github.com/yourusername/partydrinks.git
   cd partydrinks
   ```

2. Create a new Supabase project and set it up. Reference the [/SUPABASE_SETUP.md](/SUPABASE_SETUP.md) file for DB schema and stuff. 💾

3. Install dependencies and run locally: 💻

   ```bash
   pnpm / npm install
   pnpm / npm run dev
   ```

4. Link Repo to Vercel: 🔄

## 🔧 Environment Variables

Create a `.env` file with the following variables: 🔐

```bash
NEXT_PUBLIC_SUPABASE_URL=blahblah
NEXT_PUBLIC_SUPABASE_ANON_KEY=blahblah
SUPABASE_URL=blahblah
SUPABASE_SERVICE_ROLE_KEY=blahblah
NEXTAUTH_SECRET="Very Nice Pass"

```

## 📱 Screenshots

![SS from site](https://i.imgur.com/Dqip9cQ.png) 📸

## 👨‍💻 Development

This app is built with: 🛠️

- Next.js ⚛️
- Supabase 🔥
- Framer Motion for those sweet animations ✨
- Tailwind CSS for styling 🎨
- shadcn/ui components 🧩

## 📝 License

MIT - Go wild but drink responsibly! 🍺➡️🚫🚗

## 🥂 Contributions

Contributions are welcome! Add new features, improve the UI, or suggest new drinking games to incorporate. 🤝

## 🔮 Coming Soon

- Drink recommendations based on your past choices - (To get more or keep drunk lvl) 🧠🍹
- Party photo wall to export at the end. 📷🎭
- Integration with smart bartenders based on available drinks? 🤖🍸
- Hangover prediction algorithm (still in research phase 🤕) (for Alex) 📊💊
- Multiplier based on how frequent you drink. ⏱️✖️
- Cheater prevention (Albert)

---

**Remember:** With great drinking comes great responsibility. Party on, but stay safe! 🎵🎮🎯🚫🚗🥤
