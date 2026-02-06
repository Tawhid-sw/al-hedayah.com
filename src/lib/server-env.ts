function Env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const serverEnv = {
  DATABASE_URL: Env("DATABASE_URL"),
  BETTER_AUTH_SECRET: Env("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: Env("BETTER_AUTH_URL"),
  GOOGLE_CLIENT_ID: Env("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: Env("GOOGLE_CLIENT_SECRET"),
};
