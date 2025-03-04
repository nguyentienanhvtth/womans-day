# TogetherWeRise - International Women's Day Project

An interactive real-time web application for International Women's Day where people can collectively build a symbol by adding colored blocks with messages.

## Features

- Real-time interaction using Supabase Realtime
- Beautiful and user-friendly interface
- Smooth animations and transitions
- Serverless architecture
- Responsive design for all devices

## Requirements

- Node.js 18+
- Free Supabase account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd womans-day
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Supabase project:
- Create a new project on Supabase
- Copy your project URL and anon key
- Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

Visit http://localhost:3000 to view the application.

## Deployment

This project can be easily deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your Supabase environment variables in Vercel
4. Deploy!

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (Database & Real-time)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
