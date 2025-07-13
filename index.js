const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const mysql = require("mysql2/promise");
const amqp = require("amqplib");

const MATCH_QUEUE = "phone.resolver.queue";
const EXCLUDED_QUEUE = "phone.excluded.queue";

(async () => {
  try {
    // Connect to MySQL
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    // Get ALL rows
    const [allRows] = await conn.execute(
      "SELECT sms_id, Customer_Name, Client_Id, Aging_ODs, Aging_Loans, Overal_Aging, Branch, Relationship_Manager, Telephone, Arrear, RO_NAME FROM par_report"
    );

    // Filter rows
    const matchingRows = allRows.filter((r) => [3, 7].includes(r.Overal_Aging));
    const excludedRows = allRows.filter(
      (r) => ![3, 7].includes(r.Overal_Aging)
    );

    console.log(
      `✅ Found ${matchingRows.length} matching records (Day 3 or Day 7).`
    );
    console.log(
      `🚫 Found ${excludedRows.length} records with Overal_Aging ≠ 3 or 7.`
    );

    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Ensure both queues exist
    await channel.assertQueue(MATCH_QUEUE, { durable: true });
    await channel.assertQueue(EXCLUDED_QUEUE, { durable: true });

    // Send matching records
    for (const row of matchingRows) {
      row.sms_id = uuidv4(); // generate a new unique ID
      const msg = JSON.stringify(row);
      channel.sendToQueue(MATCH_QUEUE, Buffer.from(msg), { persistent: true });
      console.log(`📤 Sent to ${MATCH_QUEUE}: ${msg}`);
    }

    for (const row of excludedRows) {
      row.sms_id = uuidv4();
      const msg = JSON.stringify(row);
      channel.sendToQueue(EXCLUDED_QUEUE, Buffer.from(msg), {
        persistent: true,
      });
      console.log(`📤 Sent to ${EXCLUDED_QUEUE}: ${msg}`);
    }

    await channel.close();
    await connection.close();
    await conn.end();
    console.log("✅ All messages sent. Task complete.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
