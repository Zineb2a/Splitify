import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ExpenseDetailScreen from "../screens/ExpenseDetailScreen";
import SettleUpSelectMethod from "../screens/SettleUpSelectMethod";
import SettleUpSuccess from "../screens/SettleUpSuccess";
import SettleUpGroupSelect from "../screens/SettleUpGroupSelect";

import NewExpenseTypeScreen from "../screens/NewExpenseTypeScreen";
import NewExpenseFriend from "../screens/NewExpenseFriend";
import NewExpenseGroup from "../screens/NewExpenseGroup";
import ExpenseSuccessScreen from "../screens/ExpenseSuccessScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailScreen from "../screens/GroupDetailScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      <Stack.Screen name="SettleUpSelect" component={SettleUpSelectMethod} />
      <Stack.Screen name="SettleUpSuccess" component={SettleUpSuccess} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen
        name="SettleUpGroupSelect"
        component={SettleUpGroupSelect}
      />

      {/* Add Expense Flow */}
      <Stack.Screen name="NewTransaction" component={NewExpenseTypeScreen} />
      <Stack.Screen name="NewExpenseFriend" component={NewExpenseFriend} />
      <Stack.Screen name="NewGroupExpense" component={NewExpenseGroup} />
      <Stack.Screen name="ExpenseSuccess" component={ExpenseSuccessScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
