// app/metadata.ts
export const metadata = {
    metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    title: "Next.js and Supabase Starter Kit",
    description: "The fastest way to build apps with Next.js and Supabase",
  };
  