import {NavigatorScreenParams} from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
  GraphQLTest: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  ProductList: {
    category: string;
    title: string;
  };
  ProductDetail: {
    productId: string;
  };
  Checkout: undefined;
  Auth: {
    returnTo?: 'Checkout' | 'Profile';
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
