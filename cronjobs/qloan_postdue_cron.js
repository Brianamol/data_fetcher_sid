require("dotenv").config();
const mysql = require("mysql2/promise");
const amqp = require("amqplib");

const QUEUE = "qloan_due";

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.execute(`
    SELECT CUSTID, CUSTOMERNAME, LOANBALANCE, STARTDATE
    FROM QLOANS
    WHERE ParDays = '1'
  `);

  await connection.end();

  if (!rows.length) {
    console.log("✅ No post-due QLoans to notify today.");
    return;
  }

  const mqConn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await mqConn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  for (const row of rows) {
    const payload = {
      cust_id: row.CUSTID,
      cust_name: row.CUSTOMERNAME,
      loan_balance: row.LOANBALANCE,
      start_date: row.STARTDATE,
      template_type: "qloan_due",
    };

    await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
    console.log(`📨 Queued QLoan due notification for: ${row.CUSTID}`);
  }

  await channel.close();
  await mqConn.close();
})();
