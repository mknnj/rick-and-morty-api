const mongoose = require('mongoose')
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const { collection } = require('../utils/helpers')

const { Schema } = mongoose

const favouriteSchema = new Schema({
  user_id: String,
  update_date: Date,
  character_id: Number,
})

favouriteSchema.statics.structure = (res) => {
  const sortSchema = ({ user_id, update_date, character_id }) => ({
    user_id,
    update_date: update_date.toString(),
    character_id
  })

  return Array.isArray(res) ? res.map(sortSchema) : sortSchema(res)
}


favouriteSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('Favourite', favouriteSchema)
