import { Connection } from 'mongoose';

export const deleteAllData = async (databaseConnection: Connection) => {
  const collections = await databaseConnection.db.listCollections().toArray();

  for (const collection of collections) {
    const collectionName = collection.name;
    const dbCollection = databaseConnection.db.collection(collectionName);
    await dbCollection.deleteMany({});
  }
};
