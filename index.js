const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const mysql = require("mysql2/promise");
const amqp = require("amqplib");

const QUEUE = "phone.resolver.queue";

(async () => {
  try {
    // Connect to MySQL
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // Query for Day 3 and Day 7 accounts
    const [rows] = await conn.execute(
      "SELECT Customer_Name, Client_Id, Aging_ODs, Aging_Loans, Overal_Aging, Branch, Relationship_Manager, Telephone, Arrear, RO_NAME FROM par_report WHERE Overal_Aging IN (3, 7)"
    );

    console.log(`✅ Found ${rows.length} matching records.`);

    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    for (const row of rows) {
      const message = {
        sms_id: uuidv4(), // ✅ generate a new unique sms_id
        ...row,
      };

      const msg = JSON.stringify(message);
      channel.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });
      console.log(`📤 Sent: ${msg}`);
    }

    await channel.close();
    await connection.close();
    await conn.end();
    console.log("✅ Done sending messages.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
