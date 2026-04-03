import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/ssr', '@supabase/supabase-js', 'exceljs'],
};

export default nextConfig;
