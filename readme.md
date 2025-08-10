# Kafka Docker Setup

This project sets up a local Apache Kafka instance using Docker.

## Prerequisites
- Docker installed on your machine

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd kafka-docker

## Start Kafka & Zookeeper
docker-compose up -d

## Check running containers
docker ps

## List Kafka Topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

## Create a Kafka Topic

docker exec -it kafka kafka-topics \
  --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

## Produce Messages
docker exec -it kafka kafka-console-producer \
  --broker-list localhost:9092 \
  --topic my-topic

## Consume Messages

docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --from-beginning

## Stopping
docker-compose down