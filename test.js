const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://dev:JUU51HQKMhi6zvyn@dev.lr81i.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);

    const doc = await TestModel.create({ name: 'Test Document' });
    console.log('Document:', doc);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
