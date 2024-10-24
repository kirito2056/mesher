import { ethers } from 'ethers';
import mysql from 'mysql2/promise';

const INFURA_PROJECT_ID = '9cc02279c35b466f8c999bc0c8b09345';
const NETWORK = 'mainnet';
const INFURA_URL = `https://${NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`;

const provider = new ethers.JsonRpcProvider(INFURA_URL);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'gkwls9409!',
  database: 'mesher',
};

async function saveBlockNumberToDB(blockNumber: number): Promise<void> {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const query = 'INSERT INTO block_info (block_number) VALUES (?)';
    await connection.execute(query, [blockNumber]);
    console.log(`Block number ${blockNumber} saved to DB`);
  } catch (error) {
    console.error('Error saving to DB:', error);
  } finally {
    await connection.end();
  }
}

async function getLatestBlockNumber(): Promise<void> {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("Latest Block Number: ", blockNumber);
    await saveBlockNumberToDB(blockNumber);
  } catch (error) {
    console.error("Error fetching block number: ", error);
  }
}

setInterval(getLatestBlockNumber, 10000);
