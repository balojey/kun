![Aven Logo](https://github.com/user-attachments/assets/615d8a31-c5b0-43b6-8fb9-3f52132ff76e)

<p align="center">
  Aven - AI Voice Assistant for Email Productivity
</p>

## Getting started

1. Clone the repo

```bash
git clone https://github.com/elevenlabs/elevenlabs-docs.git
cd examples/elevenlabs-nextjs
```

2. Setup the `.env` file

```bash
cp .env.example .env
```

- ELEVENLABS_API_KEY: Get your API key from [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
- IRON_SESSION_SECRET_KEY: Generate using `openssl rand -base64 32`
- PICA_SECRET_KEY: Get your secret key from [PicaOS](https://pica.ai)
- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key

3. Install/run the project

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## About Aven

Aven is an AI-powered voice assistant designed specifically for email productivity. It helps busy professionals manage, reply to, and organize emails through natural conversation.

### Key Features

- **Voice-First Interface**: Simply speak to compose, reply, and manage emails
- **Smart Email Control**: Archive, delete, schedule, and organize emails with natural language
- **AI Understanding**: Advanced AI comprehends context and intent for accurate email actions
- **Tool Integration**: Connect Gmail, Calendar, Slack, and more for unified productivity
- **Enterprise Security**: Bank-level encryption and privacy controls

### Capabilities

- Text to Speech (ElevenLabs)
- Speech to Text (ElevenLabs)
- Sound Effects (ElevenLabs)
- Conversational AI (ElevenLabs)
- Email Management (PicaOS)
- Tool Integrations (PicaOS)

## Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Voice AI**: ElevenLabs SDK
- **Automation**: PicaOS AI
- **Database**: Supabase
- **Authentication**: Supabase Auth

## Learn More

- [ElevenLabs Documentation](https://elevenlabs.io/docs) - learn about ElevenLabs features and API
- [PicaOS Documentation](https://docs.pica.ai) - learn about PicaOS automation platform
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features