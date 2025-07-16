const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const QUEUE_NAME = "sidian.sms.qloan";

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
}

async function sendToQueue(payload) {
  if (!channel) {
    await connectRabbitMQ();
  }
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  console.log(`📤 Sent to queue:`, payload);
}

module.exports = sendToQueue;
