import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ApolloProvider} from '@apollo/client/react';
import {RootNavigator} from './src/navigation';
import {embraceService} from './src/services/embrace';
import {apolloClient} from './src/services/apollo';

function App(): React.JSX.Element {
  const [isEmbraceReady, setIsEmbraceReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Embrace SDK
      const started = await embraceService.initialize();

      if (started) {
        console.log('Embrace SDK initialized successfully');
        embraceService.addBreadcrumb('APP_INITIALIZED');
      } else {
        console.log('Embrace SDK initialization returned false - continuing without SDK');
      }

      setIsEmbraceReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      // Still allow the app to run even if Embrace fails
      setIsEmbraceReady(true);
    }
  };

  if (!isEmbraceReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <NavigationContainer
          onStateChange={state => {
            // Track navigation state changes for analytics
            const currentRoute = state?.routes[state.index];
            if (currentRoute?.name) {
              embraceService.addBreadcrumb(`SCREEN_VIEW_${currentRoute.name}`);
            }
          }}>
          <RootNavigator />
        </NavigationContainer>
        {initError && __DEV__ && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>Embrace SDK: {initError}</Text>
          </View>
        )}
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
    textAlign: 'center',
  },
});

export default App;
