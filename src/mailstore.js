const config = require('./config');
const MAX_MAILS = config.MAX_MAILS || 50;
const EXPIRE_MS = (config.MAIL_EXPIRE_MINUTES || 10) * 60 * 1000; // 10分钟
const store = new Map(); // mailboxAddr -> [mail, ...]
const store2 = require('./store');

// function saveMail(mailboxAddr, mail) {
//   mail._ts = Date.now(); // 增加时间戳
//   if (!store2.hasMailbox(mailboxAddr)) {
//    store.set(mailboxAddr, []);
//   }
//   const arr = store.get(mailboxAddr);
//   arr.unshift(mail);
//   if (arr.length > MAX_MAILS) arr.length = MAX_MAILS;
// }

function saveMail(mailboxAddr, mail) {
  store2.saveMail(mailboxAddr,mail);
}

// function getMailsByMailbox(mailboxAddr) {
//   const now = Date.now();
//   const arr = store.get(mailboxAddr) || [];
//   // 只返回未过期的邮件
//   return arr.filter(mail => now - (mail._ts || 0) < EXPIRE_MS);
// }

async function getMailsByMailbox(mailboxAddr) {
  return await store2.getMailsByMailbox(mailboxAddr);
}

async function getMailByIdx(mailboxAddr, idx){
  return await store2.getMailByIdx(mailboxAddr,idx);
}

// function getMailByIdx(mailboxAddr, idx) {
//   const now = Date.now();
//   const arr = store.get(mailboxAddr) || [];
//   // 获取指定索引的邮件，确保邮件未过期
//   const mail = arr[idx];
//   if (mail && (now - (mail._ts || 0) < EXPIRE_MS)) {
//     return mail;
//   }
//   return null;
// }


async function deleteMail(mailboxAddr, idx){
  return await store2.deleteMail(mailboxAddr,idx);
}

// function deleteMail(mailboxAddr, idx) {
//   const arr = store.get(mailboxAddr);
//   if (arr && arr[idx] !== undefined) {
//     arr.splice(idx, 1);
//     return true;
//   }
//   return false;
// }

// 定时清理过期邮件
setInterval(() => {
  // const now = Date.now();
  // for (const [id, arr] of store.entries()) {
  //   store.set(id, arr.filter(mail => now - (mail._ts || 0) < EXPIRE_MS));
  // }
  store2.clear();
}, 60 * 1000); // 每分钟清理一次

module.exports = {
  saveMail,
  getMailsByMailbox,
  getMailByIdx,
  deleteMail
};