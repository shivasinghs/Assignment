const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'redis-11688.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11688
    },
    username: 'default',
    password: 'oMOqreA0knxPgPhonBQ2dbHaYWXy0g4F'
});

client.on('error', err => console.error('Redis Client Error', err));

async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log('Connected to Redis');
    }
}

connectRedis();

module.exports = client;


