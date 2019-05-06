import * as types from './../constants/ActionTypes';
import v4 from 'uuid/v4';


export function fetchSongId(title) {
  return function (dispatch) {
    const localSongId = v4();
    dispatch(requestSong(title, localSongId));
    title = title.replace(' ','_');
    return fetch('http://api.musixmatch.com/ws/1.1/track.search?&q_track=' + title + '&page_size=1&s_track_rating=desc&apikey=748038d2c9aa6b31ea2062d5fce773b4').then(
      response => response.json(),
      error => console.log('An error occurred.', error)
    ).then(function(json) {
      if (json.message.body.track_list.length > 0) {
        const shortPath = json.message.body.track_list[0].track;
        const musicMatchId = shortPath.track_id;
        const artist = shortPath.artist_name;
        const title = shortPath.track_name;
        fetchLyrics(title, artist, musicMatchId, localSongId, dispatch);
      } else {
        console.log('We couldn\'t locate a song under that ID!');
      }

    });
  };
}

export function fetchLyrics(title, artist, musicMatchId, localSongId, dispatch) {
  return fetch('http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + musicMatchId + '&apikey=748038d2c9aa6b31ea2062d5fce773b4').then(
    response => response.json(),
    error => console.log('An error occurred.', error)).then(function(json) {
    if (json.message.body.lyrics) {
      let lyrics = json.message.body.lyrics.lyrics_body;
      lyrics = lyrics.replace('""', '');
      const songArray = lyrics.split(/\n/g).filter(entry => entry!="");
      dispatch(receiveSong(title, artist, localSongId, songArray));
      dispatch(changeSong(localSongId));
    } else {
      console.log('We couldn\'t locate lyrics for this song');
      this.state.songId[localSongId].splice
    }
  });
}

export const receiveSong = (title, artist, songId, songArray) => ({
  type: types.RECEIVE_SONG,
  songId,
  title,
  artist,
  songArray,
  receivedAt: Date.now()
});

export const deleteSong = () => ({
  type: types.DELETE_SONG,
});

export const nextLyric = (currentSongId) => ({
  type: types.NEXT_LYRIC,
  currentSongId
});

export const restartSong = (currentSongId) => ({
  type: types.RESTART_SONG,
  currentSongId
});

export const changeSong = (newSelectedSongId) => ({
  type: types.CHANGE_SONG,
  newSelectedSongId
});

export const requestSong = (title, localSongId) => ({
  type: types.REQUEST_SONG,
  title,
  songId: localSongId
});
