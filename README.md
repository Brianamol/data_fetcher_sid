# data_fetcher_sid

This microservice fetches records from MySQL for accounts in Day 3 and Day 7 arrears, then publishes them to a RabbitMQ queue `phone.resolver.queue`.

## Tech Stack

- Node.js
- MySQL
- RabbitMQ
- Docker
- Kubernetes (deploy-ready)
- Jenkins (CI-ready)

## How to Run Locally

1. Set up `.env`
2. Run RabbitMQ in Docker
3. Run `node index.js`
