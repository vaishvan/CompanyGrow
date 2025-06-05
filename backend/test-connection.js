const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://0.0.0.0/companygrow');
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection ready state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Create a simple test document to ensure the database is created
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', testSchema);
    await TestModel.create({ name: 'test' });
    console.log('✅ Test document created successfully!');
    
    // Clean up
    await TestModel.deleteMany({});
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
};

testConnection();
