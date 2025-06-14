const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { getMailsByMailbox, getMailByIdx, deleteMail } = require('./mailstore');

const app = express();

// 修改helmet配置，完全禁用CSP检查，便于开发环境使用
app.use(helmet({
  contentSecurityPolicy: false  // 完全禁用CSP检查，便于开发环境使用
}));

app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 提供配置信息给前端
app.get('/api/config', (req, res) => {
  // 使用配置中的域名
  const domain = config.getDomain();

  res.json({
    domain: domain
  });
});

// 删除某邮箱的指定邮件（邮箱为完整地址）
app.delete('/api/mails/:mailboxAddr/:idx', (req, res) => {
  const mailboxAddr = decodeURIComponent(req.params.mailboxAddr);
  const { idx } = req.params;
  const ok = deleteMail(mailboxAddr, Number(idx));
  ok.then((data)=>{
    res.json({ success: data });
  })
});

// 获取某邮箱的所有邮件列表（邮箱为完整地址）
app.get('/api/mails/:mailboxAddr', (req, res) => {
  const mailboxAddr = decodeURIComponent(req.params.mailboxAddr);
  const mails = getMailsByMailbox(mailboxAddr);
  mails.then((data)=>{
    res.json({ data });
  });
});

// 获取某邮箱的指定邮件（邮箱为完整地址）
app.get('/api/mails/:mailboxAddr/:idx', (req, res) => {
  const mailboxAddr = decodeURIComponent(req.params.mailboxAddr);
  const { idx } = req.params;
  const mail = getMailByIdx(mailboxAddr, Number(idx));
  mails.then((data)=>{
    if (data) {
      res.json({ mails:data });
    } else {
      res.status(404).json({ error: '邮件不存在或已过期' });
    }
  });

});

module.exports = app;