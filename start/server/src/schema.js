/*
The schema will go inside the gql function (between the backticks).
The language we'll use to write the schema is GraphQL's
schema definition language (SDL).
*/
const { gql } = require('apollo-server');

/*
Most of the definitions in a GraphQL schema are object types.
Each object type you define should represent an object that an application
client might need to interact with.
*/
const typeDefs = gql`
  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type User {
    id: ID!
    email: String!
    trips: [Launch]!
    token: String
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }

  type Query {
    launches(
      """
      The number of results to show. Must be >= 1. Default = 20
      """
      pageSize: Int
      """
      If you add a cursor here, it will only return results _after_ this cursor
      """
      after: String
      ): LaunchConnection!
    launch(id: ID!): Launch
    me: User
  }

  """
    Simple wrapper around our list of launches that contains a cursor to the
    last item in the list. Pass this cursor to the launches query to fetch results
    after these.
  """

  type LaunchConnection { # add this below the Query type as an additional type.
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]!
  }

  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): User
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }
`;

module.exports = typeDefs;
