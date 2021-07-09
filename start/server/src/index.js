/* The dotenv package provides support for reading 
environment variables from the .env file.
*/
require('dotenv').config();
/*
This code imports the ApolloServer class from apollo-server,
along with our schema from src/schema.js.
It then creates a new instance of ApolloServer and passes it
the imported schema via the typeDefs property.
*/
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const resolvers = require('./resolvers');
const isEmail = require('isemail');

/*
First, we import and call the createStore function to set up our SQLite database.
Then, we add the dataSources function to the ApolloServer constructor to connect
instances of LaunchAPI and UserAPI to our graph.
We also make sure to pass the database to the UserAPI constructor.
*/
const store = createStore();
const server = new ApolloServer({
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = req.headers && req.headers.authorization || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) return { user: null };
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = users && users[0] || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/sandbox
  `);
});
