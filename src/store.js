const mysql      = require('mysql2');
const config = require("./config");
const EXPIRE_MS = (config.MAIL_EXPIRE_MINUTES || 10) * 60 * 1000; // 10分钟

function saveMail(mailboxAddr, mail) {
    const conn = getConnection();
    const addSql = 'INSERT INTO `mail`(`box`,`mail_to`, `mail_from`, `subject`, `text`, `html`, `date`,`attachments`,`raw`) VALUES (?,?,?,?,?,?,?,?,?)';
    let attachments = null; 
    if(mail.attachments!=null){
        attachments = JSON.stringify(mail.attachments);
    }
    const  addSqlParams = [mailboxAddr,mail.to,mail.from,mail.subject,mail.text,mail.html,mail.date,attachments,mail.raw];
    conn.query(addSql,addSqlParams,function (err, result) {
        if(err){
            console.log('[INSERT ERROR] - ',err.message);
            conn.end();
            return;
        }
        conn.end();
        // console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);
        // console.log('INSERT ID:',result);
        // console.log('-----------------------------------------------------------------\n\n');
    });

}

async function getMailsByMailbox(mailboxAddr){
    const conn = getConnection();
    const sql = 'SELECT * FROM `mail` WHERE box = ? order by `date` desc';
    const sqlParams = [mailboxAddr];
    console.log(sql);
    console.log(sqlParams);
    return new Promise((resolve) => {
        conn.query(sql, sqlParams, function (err, result) {
            let data=[];
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                conn.end();
                resolve(null);
                return;
            }
            for (let i = 0; i < result.length; i++) {
                let attachments = null;
                if(result[i]['attachments']!=null){
                    attachments = JSON.parse(result[i]['attachments']);
                }
                const mail = {
                    to: result[i]['mail_to'],
                    from: result[i]['mail_from'],
                    subject: result[i]['subject'],
                    text: result[i]['text'],
                    html: result[i]['html'],
                    date: result[i]['date'],
                    attachments: attachments,
                    raw: result[i]['raw']
                };
                data.push(mail);
            }
            conn.end(); // 关闭连接（建议在所有操作完成后执行）
            resolve(data);
        });
    });
}

async function getMailByIdx(mailboxAddr, idx){
    const conn = getConnection();
    const sql = 'SELECT * FROM `mail` WHERE box = ? order by `date` desc limit ?,1';
    const sqlParams = [mailboxAddr,idx];
    return new Promise((resolve) => {
        conn.query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                conn.end();
                resolve(null);
                return;
            }
            if (result.length > 0){
                let i = 0;
                let attachments = null;
                if(result[i]['attachments']!=null){
                    attachments = JSON.parse(result[i]['attachments']);
                }
                const mail = {
                    to: result[i]['mail_to'],
                    from: result[i]['mail_from'],
                    subject: result[i]['subject'],
                    text: result[i]['text'],
                    html: result[i]['html'],
                    date: result[i]['date'],
                    attachments: attachments,
                    raw: result[i]['raw']
                };
                conn.end(); // 关闭连接（建议在所有操作完成后执行）
                resolve(mail);
            }else{
                conn.end(); // 关闭连接（建议在所有操作完成后执行）
                resolve(null);
            }
        });
    });
}

async function deleteMail(mailboxAddr, idx){
    const conn = getConnection();
    const sql = 'SELECT id FROM `mail` WHERE box = ? order by `date` desc limit ?,1';
    const sqlParams = [mailboxAddr,idx];
    return new Promise((resolve) => {
        conn.query(sql, sqlParams, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                conn.end();
                resolve(false);
                return;
            }
            if (result.length <= 0){
                conn.end(); // 关闭连接（建议在所有操作完成后执行）
                resolve(true);
                return;
            }
            console.log(result);
            let id = result[0]['id'];
            const deleteSql = "DELETE FROM `mail` WHERE ID = ?";
            const deleteSqlParams = [id];
            conn.query(deleteSql, deleteSqlParams, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    conn.end();
                    resolve(false);
                    return;
                }
                conn.end(); // 关闭连接（建议在所有操作完成后执行）
                resolve(true);
            });
        });
    });
}

function formatCustom(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function clear(){
    const now = Date.now();
    let time = now - EXPIRE_MS;
    const conn = getConnection();
    const sql = 'SELECT id FROM `mail` WHERE `date` < ? order by `date` desc limit 0,1000';
    const sqlParams = [formatCustom(new Date(time))];
    conn.query(sql, sqlParams, function (err, result) {
        let data=[];
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            conn.end();
            return;
        }
        for (let i = 0; i < result.length; i++) {
            const id = result[i]['id'];
            data.push(id);
        }
        if(data.length === 0 ){
            conn.end();
            return;
        }
        // console.log(data.join(","));
        const deleteSql = "DELETE FROM `mail` WHERE ID in ("+data.join(",")+")";
        console.log(deleteSql);
        conn.query(deleteSql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                conn.end();
                return;
            }
            conn.end();
        });
    });
}

function getConnection(){
    let connection = mysql.createConnection({
        host     : config.MYSQL_HOST,
        user     : config.MYSQL_USER,
        password : config.MYSQL_PASSWORD,
        database : config.MYSQL_DB,
        port:config.MYSQL_PORT
    });

    connection.connect();
    return connection;
}



module.exports = {
    saveMail,
    getMailsByMailbox,
    getMailByIdx,
    deleteMail,
    clear
};

// console.log('init');
// const mail = {
//     to: '1@1.com',  // 使用修正后的收件人地址
//     from: '1@2.com',
//     subject: '内容11',
//     text: '内容21',
//     html: '内容31',
//     date: new Date(),
//     attachments: []
// };
// saveMail('1@1.com',mail);
// clear();

// let result = getMailsByMailbox("1@1.com");
// result.then((data)=>{
//     console.log(result);
// });

