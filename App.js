import { View, Text,StatusBar } from 'react-native'
import React from 'react'
import MusicPlayer from './Component/MusicPlayer'
const App = () => {
  return (
    <View style={{
      flex:1,
      backgroundColor:'#1b1a1a'
      }}>
      <StatusBar backgroundColor='#2e2c2c' barStyle='light-content'/>
      <MusicPlayer />
    </View>
  )
}

export default App