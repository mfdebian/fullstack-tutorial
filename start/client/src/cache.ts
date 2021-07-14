import { InMemoryCache, Reference, makeVar } from '@apollo/client';

export const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        /*
        Our two field policies each include a single field: a read
        function. Apollo Client calls a field's read function
        whenever that field is queried. The query result uses
        the function's return value as the field's value,
        regardless of any value in the cache or on your
        GraphQL server.
        */
        isLoggedIn: {
          read() {
            return isLoggedInVar();
          }
        },
        cartItems: {
          read() {
            return cartItemsVar();
          }
        },
        launches: {
          keyArgs: false,
          merge(existing, incoming) {
            let launches: Reference[] = [];
            if (existing && existing.launches) {
              launches = launches.concat(existing.launches);
            }
            if (incoming && incoming.launches) {
              launches = launches.concat(incoming.launches);
            }
            return {
              ...incoming,
              launches,
            };
          }
        }
      }
    }
  }
});

// Initializes to true if localStorage includes a 'token' key,
// false otherwise
export const isLoggedInVar = makeVar<boolean>(!!localStorage.getItem('token'));

// Initializes to an empty array
export const cartItemsVar = makeVar<string[]>([]);
