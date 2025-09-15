import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "react-native"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import AppNavigator from "./src/navigation/AppNavigator"

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar barStyle="dark-content" backgroundColor="#6366f1" />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  )
}
