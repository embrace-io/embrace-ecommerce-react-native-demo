import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {gql} from '@apollo/client';
import {useApolloClient} from '@apollo/client/react';

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
      emoji
    }
  }
`;

const GET_COUNTRY = gql`
  query GetCountry($code: ID!) {
    country(code: $code) {
      name
      native
      capital
      emoji
      currency
      languages {
        name
      }
    }
  }
`;

const GET_CONTINENTS = gql`
  query GetContinents {
    continents {
      code
      name
    }
  }
`;

interface QueryResult {
  operationName: string;
  headerValue: string;
  data: unknown;
  error?: string;
  durationMs: number;
}

export const GraphQLTestScreen: React.FC = () => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);

  const runQuery = useCallback(
    async (
      query: ReturnType<typeof gql>,
      operationName: string,
      variables?: Record<string, unknown>,
    ) => {
      setLoading(true);
      const start = Date.now();
      const headerValue = `/graphql/${operationName}`;

      try {
        const {data} = await client.query({
          query,
          variables,
          fetchPolicy: 'network-only',
        });

        setResults(prev => [
          {
            operationName,
            headerValue,
            data,
            durationMs: Date.now() - start,
          },
          ...prev,
        ]);
      } catch (err) {
        setResults(prev => [
          {
            operationName,
            headerValue,
            data: null,
            error: err instanceof Error ? err.message : String(err),
            durationMs: Date.now() - start,
          },
          ...prev,
        ]);
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  const clearResults = useCallback(() => setResults([]), []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GraphQL x-emb-path Test</Text>
        <Text style={styles.subtitle}>
          Each query sends a custom x-emb-path header with the operation name.
          Check the Embrace dashboard to see if requests are grouped by this
          header or all under /graphql.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queries</Text>

        <QueryButton
          label="Get Countries"
          operationName="GetCountries"
          disabled={loading}
          onPress={() => runQuery(GET_COUNTRIES, 'GetCountries')}
        />
        <QueryButton
          label="Get Country (US)"
          operationName="GetCountry"
          disabled={loading}
          onPress={() =>
            runQuery(GET_COUNTRY, 'GetCountry', {code: 'US'})
          }
        />
        <QueryButton
          label="Get Continents"
          operationName="GetContinents"
          disabled={loading}
          onPress={() => runQuery(GET_CONTINENTS, 'GetContinents')}
        />
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color="#000"
          style={styles.spinner}
        />
      )}

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            Results ({results.length})
          </Text>
          {results.length > 0 && (
            <TouchableOpacity onPress={clearResults}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {results.length === 0 && (
          <Text style={styles.emptyText}>
            Run a query to see results here
          </Text>
        )}

        {results.map((result, index) => (
          <ResultCard key={`${result.operationName}-${index}`} result={result} />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>What to verify:</Text>
        <Text style={styles.footerItem}>
          1. Open Embrace dashboard after running queries
        </Text>
        <Text style={styles.footerItem}>
          2. All requests should appear as POST /graphql
        </Text>
        <Text style={styles.footerItem}>
          3. The x-emb-path header value is NOT used for grouping
        </Text>
        <Text style={styles.footerItem}>
          4. This confirms the SDK ignores the header
        </Text>
      </View>
    </ScrollView>
  );
};

const QueryButton: React.FC<{
  label: string;
  operationName: string;
  disabled: boolean;
  onPress: () => void;
}> = ({label, operationName, disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}>
    <Text style={styles.buttonLabel}>{label}</Text>
    <Text style={styles.buttonHeader}>
      x-emb-path: /graphql/{operationName}
    </Text>
  </TouchableOpacity>
);

const ResultCard: React.FC<{result: QueryResult}> = ({result}) => {
  const [expanded, setExpanded] = useState(false);
  const isError = !!result.error;

  const dataPreview = result.data
    ? JSON.stringify(result.data, null, 2).slice(0, 200)
    : 'null';

  return (
    <TouchableOpacity
      style={[styles.resultCard, isError && styles.resultCardError]}
      onPress={() => setExpanded(!expanded)}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultOp}>{result.operationName}</Text>
        <Text style={styles.resultDuration}>{result.durationMs}ms</Text>
      </View>
      <Text style={styles.resultHeaderValue}>
        Header sent: {result.headerValue}
      </Text>
      {isError ? (
        <Text style={styles.resultError}>{result.error}</Text>
      ) : (
        <Text style={styles.resultPreview} numberOfLines={expanded ? 0 : 3}>
          {dataPreview}
          {!expanded && dataPreview.length >= 200 ? '...' : ''}
        </Text>
      )}
      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap to expand'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonHeader: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  spinner: {
    marginVertical: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2ecc71',
  },
  resultCardError: {
    borderLeftColor: '#e74c3c',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultOp: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultDuration: {
    fontSize: 12,
    color: '#888',
  },
  resultHeaderValue: {
    fontSize: 11,
    color: '#3498db',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  resultError: {
    fontSize: 12,
    color: '#e74c3c',
  },
  resultPreview: {
    fontSize: 11,
    color: '#555',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  expandHint: {
    fontSize: 10,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 48,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
});
