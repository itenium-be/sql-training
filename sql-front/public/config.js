// Runtime configuration. Overwritten on container start by docker-entrypoint.sh
// from the API_URL / LEADERBOARD_URL environment variables.
//
// Left empty on purpose: src/config.ts then falls back to the VITE_* build time
// variables (see .env.development) and finally to its own defaults.
window.SQL_TRAINING_CONFIG = {
  api: "",
  leaderboardApi: "",
};
