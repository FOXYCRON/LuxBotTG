require('dotenv').config();

module.exports = {
  token: process.env.BOT_TOKEN,
  adminIds: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [],
  prefix: '/',

  canalReferencias: process.env.CANAL_REFERENCIAS || '-1004405209395'
};