const amqp = require("amqplib");
require("dotenv").config();

async function startQloanConsumer() {
  try {
    const conn = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    const channel = await conn.createChannel();
    const queue = process.env.QUEUE_NAME || "sms_queue";

    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 Waiting for QLoan messages in queue: ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        // Only handle QLoan message types
        if (data.type?.startsWith("qloan")) {
          console.log("📨 Received QLoan message:", data);

          // Simulate sending SMS
          console.log(`📲 Sending SMS to ${data.phone}:\n${data.message}`);
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ QLoan Consumer Error:", error.message);
  }
}

startQloanConsumer();
