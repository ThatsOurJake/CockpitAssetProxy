import { config as loadConfig } from 'dotenv';

loadConfig();

export default {
  port: process.env.PORT || 3000,
  cockpitUrl: process.env.COCKPIT_URL,
};
