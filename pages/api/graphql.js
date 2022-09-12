const {ApolloServer,makeExecutableSchema}= require('apollo-server-micro');
const {MongoClient} = require('mongodb');
const {resolvers,getUserFromToken} = require('./resolvers');
const {DB_URI,DB_NAME} = process.env;
const typeDefs = require('./typedefs');

const dotenv = require('dotenv');
dotenv.config();


const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  
  let db;
  
  const server = new ApolloServer({
    schema,
    context: async({req}) => {
      if(!db){
        try {
          const dbClient = new MongoClient(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          })
          
          if (!dbClient.isConnected()) await dbClient.connect()
          db = dbClient.db(DB_NAME) // database name
        } catch (error) {
          console.log('--->error while connecting via graphql context (db)', error)
        }
      }
      
      const user = await getUserFromToken(req.headers.authorization,db)
      return {
        db,
        user,
      }
    }
    
  })

  
  export const config = {
    api: {
      bodyParser: false,
    },
  }
  const handler = server.createHandler({path:'/api/graphql'});
  
  module.exports = handler;

