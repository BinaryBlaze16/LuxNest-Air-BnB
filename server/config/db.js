const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/luxnest';

  // Check if Atlas URI has placeholder <db_password>
  const targetUri = (uri && !uri.includes('<db_password>')) ? uri : localUri;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(` Initial MongoDB connection failed to ${targetUri}: ${error.message}`);
    
    // If Atlas failed or had placeholder, try local MongoDB fallback
    if (targetUri !== localUri) {
      try {
        console.log(` Attempting fallback to local MongoDB: ${localUri}...`);
        const fallbackConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(` Connected to local MongoDB: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(` Local MongoDB fallback also failed: ${fallbackError.message}`);
        console.error(' Please verify your MongoDB connection string in server/.env');
      }
    }
  }
};

module.exports = connectDB;
