import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from '@apollo/client';

const GRAPHQL_ENDPOINT = 'https://countries.trevorblades.com/graphql';

/**
 * Mimics Best Buy's Apollo Link that injects x-emb-path header
 * with the GraphQL operation name. This is meant to help Embrace
 * group network requests by operation instead of the generic /graphql path.
 *
 * Spoiler: the Embrace SDK ignores this header entirely. The network
 * span name is derived from URL.path, so all requests group under
 * "emb-POST /graphql" regardless of this header's value.
 */
const xEmbPathLink = new ApolloLink((operation, forward) => {
  const operationName = operation.operationName || 'UnnamedOperation';

  operation.setContext(({headers = {}}: {headers?: Record<string, string>}) => ({
    headers: {
      ...headers,
      'x-emb-path': `/graphql/${operationName}`,
    },
  }));

  console.log(
    `[x-emb-path] Setting header: /graphql/${operationName}`,
  );

  return forward(operation);
});

const httpLink = new HttpLink({uri: GRAPHQL_ENDPOINT});

export const apolloClient = new ApolloClient({
  link: from([xEmbPathLink, httpLink]),
  cache: new InMemoryCache(),
});
