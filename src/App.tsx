import React, {useState} from 'react';
import './App.css';

import {SPEAKERS, TEXT_DATA,} from "./data";

const url = `${process.env.REACT_APP_SUTTS_SERVER}/audio/so_vits_svc`;
const autoPlay = false
const AudioCache: { [key: string]: string } = {}
const PlayingAudio: HTMLAudioElement[] = []

function App() {
  const [audioUrl, setAudioUrl] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState(SPEAKERS[0].id)

  const playAudio = async (text: string, speaker: string) => {
    const key = `${text}||||${speaker}`
    let dataUrl = ""
    if (!(key in AudioCache)) {
      setAudioUrl("")
      const res = await getAudioData(text, speaker)
      console.log(res)
      if (res?.audioData) {
        const arrayBuffer = res.audioData
        console.log(res.audioData)
        dataUrl = `data:audio/wav;base64,${arrayBufferToBase64(arrayBuffer)}`
        setAudioUrl(dataUrl)
        AudioCache[key] = dataUrl
      }

    } else {
      dataUrl = AudioCache[key]
    }

    if (dataUrl) {
      const audio = new Audio(dataUrl);
      PlayingAudio.push(audio)
      audio.playbackRate = 1.25
      await audio.play();
    }
  }

  return (
    <div className="App">
      <h1>生きてください。</h1>
      <div>
        {SPEAKERS.map((speaker, index) => {
          return (
            <label key={speaker.id}>
              <input type="radio" name="speaker"
                     value={speaker.id}
                // defaultChecked={index === 0}
                     onChange={(e) => setCurrentSpeaker(e.target.value)}
                     checked={speaker.id === currentSpeaker}
              />
              {speaker.name}
            </label>
          )
        })}
      </div>
      <audio src={audioUrl} controls autoPlay={autoPlay} onCanPlay={(e) => {
        e.currentTarget.playbackRate = 1.25
      }}></audio>
      <button onClick={() => {
        PlayingAudio.forEach(audio => audio.pause())
        PlayingAudio.length = 0
        setAudioUrl("")
      }}>全部停止
      </button>
      <table>
        <tbody>
        {TEXT_DATA.map((text, index) => {
          const onClickAudio = () => playAudio(text, currentSpeaker)
          return (
            <tr key={index}>
              <td><span onClick={onClickAudio}>{text}</span></td>
              <td>
                <button onClick={onClickAudio}>play</button>
              </td>
            </tr>)
        })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}

const getAudioData = async (text: string, speaker: string) => {

  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // "Access-Control-Allow-Origin": "*"
    },
    mode: 'cors',
    body: JSON.stringify({
      text: text,
      speaker: speaker,
    })
  })
    .then(async response => {
      const audioData = await response.arrayBuffer()
      const jsonData = await response.headers.get('Response-Data')
      const json = jsonData ? JSON.parse(jsonData) : {}

      console.log(json)
      console.log(audioData)
      const sampling_rate = json["sampling_rate"]
      // return response;
      return {sampling_rate, audioData}
    })
    // .then(response => response.arrayBuffer())
    // .then(data => console.log(data))
    .catch(error => {
      // handle error here
      console.error(error);
    });

}
