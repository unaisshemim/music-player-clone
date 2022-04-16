import {
  View,
  Text,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
import songs from '../assets/Data';
import TrackPlayer,{
  Capability,
    Event,
    RepeatMode,
    State,
    usePlaybackState,
    useProgress,
    useTrackPlayerEvents
} from 'react-native-track-player';



const {width, height} = Dimensions.get('window');

const SetupPlayer=async()=>{
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities:[
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ]
  })
  await TrackPlayer.add(songs);
}
const TogglePlayBack=async(playbackState)=>{
const currentTrack=await TrackPlayer.getCurrentTrack();
if (currentTrack != null){
  if(playbackState === State.Paused){
    await TrackPlayer.play();
  }else{
    await TrackPlayer.pause();
  }
}
}

const MusicPlayer = () => {
const progress=useProgress();
  const playbackState=usePlaybackState();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentSong, setCurrentSong] = useState(0);
  const songSlider = useRef(null);
  const [repeatMode,setRepeatMode]=useState("off");
  const [trackArtWork,setTrackArtWork]=useState();
  const [trackArtist,setTrackArtist]=useState();
  const [trackTitle,setTrackTitle]=useState();

useTrackPlayerEvents([Event.PlaybackTrackChanged],async event =>{
  if(event.type ===Event.PlaybackTrackChanged && event.nextTrack != null){
    const track=await TrackPlayer.getTrack(event.nextTrack);
    const {title,artist,artwork}=track;
    setTrackArtWork(artwork);
    setTrackArtist(artist);
    setTrackTitle(title);
  }
})
const repeatIcon=()=>{

  if(repeatMode==="off"){
    return 'repeat-off'
  }
  if(repeatMode==="track")
{
  return 'repeat-once'
}if(repeatMode==='repeat'){
  return 'repeat'
}
}
const changeRepeatMode=()=>{
  if(repeatMode ==='off'){
    TrackPlayer.setRepeatMode(RepeatMode.Track);
    setRepeatMode('track')
  }if(repeatMode === 'track'){
    TrackPlayer.setRepeatMode(RepeatMode.Queue);
    setRepeatMode('repeat')
  }if(repeatMode === 'repeat'){
    TrackPlayer.setRepeatMode(RepeatMode.Off);
    setRepeatMode('off')
  }
}



  const skipTo=async(trackId)=>{
    await TrackPlayer.skip(trackId);
  }

  useEffect(() => {
    SetupPlayer()
    scrollX.addListener(({value}) => {
      // console.log(scrollX);
      // console.log("width",width);
      const index = Math.round(value / width);
      skipTo(index);
      setCurrentSong(index);
      // console.log('index',index)
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (currentSong + 1) * width,
    });
  };
  const skipToBack = () => {
    songSlider.current.scrollToOffset({
      offset: (currentSong - 1) * width,
    });
  };

  const renderSong = ({index, item}) => {
    return (
      <Animated.View
        style={{
          width: width,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: trackArtWork
            }}
            style={styles.image}
          />
        </View>
      </Animated.View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={{width: width}}>
          <Animated.FlatList
            ref={songSlider}
            data={songs}
            renderItem={renderSong}
            renderKey={item => item.id}
            horizontal
            pagingEnabled
            showHorizontalScrollIndicator={false}
            scroolEventThrottled={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {x: scrollX},
                  },
                },
              ],
              {useNativeDriver: true},
            )}
          />
          <View></View>
          <Text style={styles.title}>{trackTitle}</Text>
          <Text style={styles.artist}>{trackArtist}</Text>
        </View>
        <View>
          <Slider
            style={styles.progressBar}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            minimumTrackTintColor="#ecc720"
            maximumTrackTintColor="#ecc720"
            thumbTintColor="#ecc720"
            onSlidingComplete={async(value) => {
              await TrackPlayer.seekTo(value)
            }}
          />

          <View style={styles.progressContainer}>
            <Text style={styles.progressTimer}>{new Date(progress.position * 1000).toISOString().substr(14,5)}</Text>
            <Text style={styles.progressTimer}>{new Date((progress.duration - progress.position) * 1000).toISOString().substr(14,5)}</Text>
          </View>
        </View>
        <View style={styles.musicController}>
          <TouchableOpacity onPress={skipToBack}>
            <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>TogglePlayBack(playbackState)}>
            <Ionicons name={playbackState === State.Playing ? "ios-pause-circle":"ios-play-circle"} size={70} color="#FFD369" />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={35}
              color="#FFD369"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={()=>{console.log(trackArtWork)}}>
          <Ionicons name="heart-outline" size={30} color="#777777" />
        </TouchableOpacity>
        <TouchableOpacity onPress={changeRepeatMode}>
          <MaterialCommunityIcons name={`${repeatIcon()}`} size={30} color={repeatMode=='off'?"#777777":'#ecc720' }/>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={30} color="#777777" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={30} color="#777777" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b1a1a',
    flex: 1,
    justifyContent: 'space-between',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 300,
    height: 300,
    marginBottom: 25,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  artist: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
  },
  progressBar: {
    width: 350,
    height: 40,
    flexDirection: 'row',
    marginTop: 20,
  },
  progressContainer: {
    width: 350,
    height: 40,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTimer: {
    color: 'white',
  },
  musicController: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },

  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#777777',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default MusicPlayer;
