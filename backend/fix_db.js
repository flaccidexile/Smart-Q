const { sequelize } = require('./models');

async function fixDb() {
  try {
    await sequelize.authenticate();
    const [indexes] = await sequelize.query("SHOW INDEX FROM users");
    
    // Group by Key_name to avoid attempting to drop the same index multiple times (since multi-column indexes have multiple rows)
    const keyNames = [...new Set(indexes.map(idx => idx.Key_name))];
    
    for (const keyName of keyNames) {
      if (keyName !== 'PRIMARY') {
        console.log(`Dropping index ${keyName}...`);
        try {
          await sequelize.query(`ALTER TABLE users DROP INDEX \`${keyName}\``);
        } catch (e) {
          console.error(`Failed to drop ${keyName}:`, e.message);
        }
      }
    }
    console.log('Finished dropping indexes.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixDb();
