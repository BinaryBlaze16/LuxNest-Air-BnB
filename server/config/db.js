const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/luxnest';

  // Check if Atlas URI is valid and doesn't contain <db_password>
  const isAtlasValid = uri && !uri.includes('<db_password>') && uri.startsWith('mongodb');
  const targetUri = isAtlasValid ? uri : localUri;

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(` Initial MongoDB connection failed to ${targetUri}: ${error.message}`);
    
    // If Atlas failed or had placeholder, attempt fallback to local URI if different
    if (targetUri !== localUri && localUri.startsWith('mongodb')) {
      try {
        console.log(` Attempting fallback to local MongoDB: ${localUri}...`);
        const fallbackConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(` Connected to local MongoDB: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(` Local MongoDB fallback failed: ${fallbackError.message}`);
      }
    }
    console.error(' MongoDB Connection Notice: Please configure MONGODB_URI with IP Access (0.0.0.0/0) in MongoDB Atlas.');
  }
};

module.exports = connectDB;
