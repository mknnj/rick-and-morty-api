const models = require('../models')
const Favourite = require('../models/Favourite')
const { message: messages, collection } = require('../utils/helpers')
const { catchErrors } = require('./errors')

const buildResponse = ({ data, status, message }) => {
  if (data) {
    return {
      data,
      error: null,
    }
  }

  return {
    data: null,
    error: {
      message,
      status,
    },
  }
}

const queryById = async (Model, id) => {
  // If the param is an array
  if (Array.isArray(id)) {
    const data = await Model.find({
      id: { $in: id },
    }).select(collection.exclude)

    return buildResponse({ data: Model.structure(data) })
  }

  // If the param is a number
  if (Number.isNaN(parseInt(id))) {
    return buildResponse({ status: 500, message: messages.badParam })
  }

  const data = await Model.findOne({ id }).select(collection.exclude)

  if (!data) {
    return buildResponse({ status: 404, message: messages[`no${Model.modelName}`] })
  }

  return buildResponse({ data: Model.structure(data) })
}

const setFavouriteWithBody = async(Model, body) => {
  body.update_date = new Date()
  const data = await Model.updateOne({"user_id" : body.user_id}, body, {upsert: true}).select(collection.exclude)
  return buildResponse({ data: Model.structure(data) })

}

const getFavouriteWithId = async(Model, user_id) => {
  const data = await Model.findOne({"user_id" : user_id})
  return buildResponse({ data: Model.structure(data) })
}

const getAll = async (req, res, next) => {
  const page = (req.query.page > 0 && req.query.page) || 1
  const skip = page * collection.limit - collection.limit
  const [, name] = req.path.split('/')
  const Model = models[name]
  const opt = Object.assign(req.query, { skip })

  const { results, count } = await Model.findAndCount(opt)
  req.payload = {
    page,
    count,
    results,
  }

  next()
}

const getById = async (req, res, next) => {
  const [, name] = req.path.split('/')
  const Model = models[name]
  const { data, error } = await queryById(Model, req.params.id)

  if (error) {
    return res.status(error.status).json({ error: error.message })
  }

  req.payload = data
  next()
}

const setFavouriteForId = async (req, res, next) => {
  const { data, error } = await setFavouriteWithBody(Favourite, req.body)
  if (error) {
    return res.status(error.status).json({ error: error.message })
  }

  req.payload = data
  next()
}

const getFavouriteForId = async (req, res, next) => {
  console.log(req.params)
  const { data, error } = await getFavouriteWithId(Favourite, req.query.user_id)
  if (error) {
    return res.status(error.status).json({ error: error.message })
  }

  req.payload = data
  next()
}

module.exports = {
  getAll: catchErrors(getAll),
  getById: catchErrors(getById),
  setFavouriteForId: catchErrors(setFavouriteForId),
  getFavouriteForId: catchErrors(getFavouriteForId),
}
