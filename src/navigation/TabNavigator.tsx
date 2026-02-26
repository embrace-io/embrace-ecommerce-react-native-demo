import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen, SearchScreen, CartScreen, ProfileScreen, GraphQLTestScreen} from '../screens';
import {useCartStore} from '../store/cartStore';
import {TabParamList} from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon: React.FC<{name: string; focused: boolean}> = ({name, focused}) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Search: '🔍',
    Cart: '🛒',
    Profile: '👤',
    GraphQLTest: '🔗',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name]}
    </Text>
  );
};

const CartTabIcon: React.FC<{focused: boolean}> = ({focused}) => {
  const totalItems = useCartStore(state => state.totalItems);

  return (
    <View>
      <Text style={[styles.icon, focused && styles.iconFocused]}>🛒</Text>
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalItems > 99 ? '99+' : totalItems}
          </Text>
        </View>
      )}
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: true,
        headerTitleStyle: styles.headerTitle,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon name="Home" focused={focused} />,
          headerTitle: 'Embrace Shop',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon name="Search" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({focused}) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="GraphQLTest"
        component={GraphQLTestScreen}
        options={{
          tabBarLabel: 'GraphQL',
          tabBarIcon: ({focused}) => (
            <TabIcon name="GraphQLTest" focused={focused} />
          ),
          headerTitle: 'GraphQL Test',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    paddingBottom: 24,
    height: 80,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  icon: {
    fontSize: 24,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
