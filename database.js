import mysql from 'mysql2/promise';

async function connect() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });
        console.log('Connected to the database with threadId:', connection.threadId);
        return connection;
    } catch (err) {
        console.error('Error connecting to the database:', err.stack);
        throw err;
    }
}

export default connect;

