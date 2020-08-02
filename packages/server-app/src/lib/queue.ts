import { ConsumeMessage, Channel, connect } from 'amqplib'

export const connectionPromise = connect({
  protocol: 'amqp',
  hostname: 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT as string),
  username: process.env.RABBITMQ_USERNAME,
  password: process.env.RABBITMQ_PASSWORD
})

export const publish = async (queue: string, payload: object, channel: Channel) => {
  await channel.assertQueue(queue, {
    durable: false
  })
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))
}

const unpackMessage = (message: ConsumeMessage) => {
  try {
    return JSON.parse(message.content.toString())
  } catch (e) {
    return null
  }
}

export const subscribe = async (
  queue: string,
  handler: (payload: unknown) => Promise<unknown> | unknown,
  channel: Channel
) => {
  await channel.assertQueue(queue, { durable: false })
  await channel.consume(queue, async (message) => {
    if (!message) { return }
    const unpackedMessage = unpackMessage(message)
    if (unpackedMessage) {
      await handler(unpackedMessage)
    }
    await channel.ack(message)
  })
}
