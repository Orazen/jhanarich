// PM2 process config — production on Hostinger VPS.
// Run from the app dir:  pm2 start ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: "jhanarich",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      time: true,
    },
  ],
};
