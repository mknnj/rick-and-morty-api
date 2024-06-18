const { RESTDataSource } = require('apollo-datasource-rest')
const { MongoDataSource  } = require('apollo-datasource-mongodb')
const { message: messages, collection } = require('../utils/helpers')
const getHandler = require('../routes/middlewares')

const baseUrl = `http://localhost:${process.env.PORT || 8080}/api`

/**
 * Filter out query parameter with `null` values. Check [#103](https://github.com/afuh/rick-and-morty-api/issues/103) for more details.
 * @param {*} obj - query parameters.
 */
const pruneObject = (obj) => {
  // eslint-disable-next-line no-unused-vars
  return Object.fromEntries(Object.entries(obj).filter(([_, v = null]) => v !== null))
}

async function callHandlers(req, res, handlers) {
  for (const handler of handlers) {
    await handler(req, res, async () => {});
  }
}

class Character extends MongoDataSource {

  async characters({ filter, page }) {
    var req ={query: pruneObject({ page: page, ...filter}), "path": "/character"}
    await callHandlers(req, {}, getHandler(this.model)["find"].slice(1, -1))
    return req.payload
  }
  async charactersByIds({ ids }) {
    const data = this.model.structure(await this.findByFields({"id" : ids}).catch((error) => console.log(error)))
    return Array.isArray(data) ? data : [data]
  }
  async character({ id }) {
    const data = this.model.structure(await this.findByFields({"id" : id}).catch((error) => console.log(error)))[0]
    return data
  }
}

class Location extends MongoDataSource {

  async locations({ filter, page }) {
    var req ={query: pruneObject({ page: page, ...filter}), "path": "/location"}
    await callHandlers(req, {}, getHandler(this.model)["find"].slice(1, -1))
    return req.payload
  }
  async locationsByIds({ ids }) {
    console.log(ids)
    const data = this.model.structure(await this.findByFields({"id" : ids}).catch((error) => console.log(error)))
    console.log(data)
    return Array.isArray(data) ? data : [data]
  }
  async location({ id }) {
    console.log(id)
    const data = this.model.structure(await this.findByFields({"id" : id}).catch((error) => console.log(error)))[0]
    console.log(data)
    return data
  }
}

class Episode extends MongoDataSource {

  async episodes({ filter, page }) {
    var req ={query: pruneObject({ page: page, ...filter}), "path": "/episode"}
    await callHandlers(req, {}, getHandler(this.model)["find"].slice(1, -1))

    return req.payload
  }
  async episodesByIds({ ids }) {
    const data = this.model.structure(await this.findByFields({"id" : ids}).catch((error) => console.log(error)))
    return Array.isArray(data) ? data : [data]
  }
  async episode({ id }) {
    const data = this.model.structure(await this.findByFields({"id" : id}).catch((error) => console.log(error)))[0]
    return data
  }
}

class Favourite extends MongoDataSource  {
  async getFavouriteById({ user_id }) {
    return this.model.structure(await this.findByFields({"user_id" : user_id}).catch((error) => console.log(error)))[0]
  }

  async setFavouriteById({ user_id, character_id }) {
      const body = {user_id: user_id, character_id : character_id, update_date: new Date()}
      const data = await this.model.updateOne({"user_id" : user_id}, body, {upsert: true}).select(collection.exclude)
      return this.model.structure(body)
  }
}

module.exports = { Character, Location, Episode, Favourite }
