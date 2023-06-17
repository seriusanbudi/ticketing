const Xendit = require("xendit-node");
const x = new Xendit({
  secretKey: process.env.XENDIT_SECRET,
});
module.exports = { x };
