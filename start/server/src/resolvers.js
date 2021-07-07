const { paginateResults } = require('./utils');
/*
A resolver is a function that's responsible for populating the data for a single
field in your schema. Whenever a client queries for a particular field,
the resolver for that field fetches the requested data from the appropriate
data source.

A resolver function returns one of the following:
1.- Data of the type required by the resolver's corresponding
schema field (string, integer, object, etc.)
2.- A promise that fulfills with data of the required type
*/

/* As src/schema.js shows, our schema's Query type defines three fields:
launches, launch, and me.

For the resolver signature explanation refer to:
https://www.apollographql.com/docs/tutorial/resolvers/#the-resolver-function-signature
*/

module.exports = {
  /*
  All three resolver functions assign their first positional argument (parent)
  to the variable _ as a convention to indicate that they don't use its value.

  The launches and me functions assign their second positional argument (args)
  to __ for the same reason.

  None of the resolver functions includes the fourth positional argument (info),
  because they don't use it and there's no other need to include it.
  */
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length ? launches[launches.length - 1].cursor !==
          allLaunches[allLaunches.length - 1].cursor : false
        };
      },

    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),

    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  },

  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) {
        user.token = Buffer.from(email).toString('base64');
        return user;
      }
    },

    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesByIds({launchIds,});

      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length ? 'trips booked successfully'
          : `the following launches couldn't be booked:
          ${launchIds.filter(id => !results.includes(id),)}`,
        launches,
      };
    },

    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });
      if (!result)
        return {
          success: false,
          message: 'failed to cancel trip',
        };

      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: 'trip cancelled',
        launches: [launch],
      };
    },
  },

  Mission: {
    // The default size is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: 'LARGE' }) => {
      return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
    },
  },

  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },

  User: {
    trips: async (_, __, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // look up those launches by their ids
      return (dataSources.launchAPI.getLaunchesByIds({launchIds,}) || []);
    },
  },
};
