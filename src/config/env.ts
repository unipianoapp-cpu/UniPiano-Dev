import Config from "react-native-config"

export const ENV = {
  SUPABASE_URL: Config.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY || "",
  API_URL: Config.API_URL || "http://localhost:8000/api/v1",
  DEBUG: Config.DEBUG === "true",
}

export default ENV
