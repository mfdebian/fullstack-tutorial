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

/*
First, we import and call the createStore function to set up our SQLite database.
Then, we add the dataSources function to the ApolloServer constructor to connect
instances of LaunchAPI and UserAPI to our graph.
We also make sure to pass the database to the UserAPI constructor.
*/
const store = createStore();
const server = new ApolloServer({
  typeDefs,
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
