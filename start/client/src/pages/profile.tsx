import React, { Fragment } from 'react';
import { gql, useQuery } from '@apollo/client';

import { Loading, Header, LaunchTile } from '../components';
import { LAUNCH_TILE_DATA } from './launches';
import { RouteComponentProps } from '@reach/router';
import * as GetMyTripsTypes from './__generated__/GetMyTrips';

export const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;

interface ProfileProps extends RouteComponentProps {}

const Profile: React.FC<ProfileProps> = () => {
  const {
    data,
    loading,
    error
  } = useQuery<GetMyTripsTypes.GetMyTrips>(
    GET_MY_TRIPS,
    /* A fetch policy defines how Apollo Client uses the cache
    for a particular query. The default policy is cache-first,
    which means Apollo Client checks the cache to see if the
    result is present before making a network request.
    If the result is present, no network request occurs.

    By setting this query's fetch policy to network-only,
    we guarantee that Apollo Client always queries our server
    to fetch the user's most up-to-date list of booked trips.
    */
    { fetchPolicy: "network-only" }  );
  if (loading) return <Loading />;
  if (error) return <p>ERROR: {error.message}</p>;
  if (data === undefined) return <p>ERROR</p>;

  return (
    <Fragment>
      <Header>My Trips</Header>
      {data.me && data.me.trips.length ? (
        data.me.trips.map((launch: any) => (
          <LaunchTile key={launch.id} launch={launch} />
        ))
      ) : (
        <p>You haven't booked any trips</p>
      )}
    </Fragment>
  );
}

export default Profile;
