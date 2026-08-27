import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  appName: "Investment App",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    twoFactor(),
  ],
});