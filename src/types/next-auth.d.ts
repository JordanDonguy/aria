// types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      providers?: string[];
    };
  }

  interface User {
    id: string;
  }
}
