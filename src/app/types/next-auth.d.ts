// src/app/types/next-auth.d.ts o src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser, JWT } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
  }

  interface JWT {
    accessToken?: string;
  }
}
