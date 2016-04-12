const path = require('path')
const database = require('../server/database')
const tableScript = path.join(__dirname, '../provision/tables.sql')

database.runScriptFile(tableScript)
  .then(() => {
    console.log('Database synced successfully!')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
