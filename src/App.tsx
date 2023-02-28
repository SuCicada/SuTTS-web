import React, {useEffect, useRef, useState} from 'react';
import './App.css';
// import dotenv from 'dotenv';

import {SPEAKERS, TEXT_DATA,} from "./data";

// dotenv.config();
const url = `${process.env.REACT_APP_SUTTS_SERVER}/audio/so_vits_svc`;
const autoPlay = false

function App() {
  // const [audio, setAudio] = useState(new ArrayBuffer(0))
  const [audioUrl, setAudioUrl] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState(SPEAKERS[0].id)
  // const playAudio = (arrayBuffer: ArrayBuffer) => {
  // }
  // const [play] = useSound(audioUrl);

  // useEffect(() => {
  //   console.log(audioUrl)
  //   play();
  // }, [play, audioUrl])
  const playAudio = async (text: string, speaker: string) => {
    setAudioUrl("")

    const res = await getAudioData(text, speaker)
    console.log(res)
    // console.log(res?.audioData && 1)
    if (res?.audioData) {
      const arrayBuffer = res.audioData
      console.log(res.audioData)
      //   setAudio(res.audioData)
      // const base64String = btoa(String.fromCharCode.apply(null,
      //   arrayBuffer as unknown as number[]));
      // let audioBlob = new Blob([arrayBuffer], {type: 'audio/wav'}),
      //   dataUrl = URL.createObjectURL(audioBlob)
      // const dataUrl = `data:audio/wav;base64,${url}`;
      const dataUrl = `data:audio/wav;base64,${arrayBufferToBase64(arrayBuffer)}`
      // console.log(dataUrl)
      // setAudioUrl(dataUrl)
      // play();
      setAudioUrl(dataUrl)
      const audio = new Audio(dataUrl);
      audio.playbackRate = 1.25
      await audio.play();


//                     const audioCtx = new AudioContext();
//                     const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
// // Create an AudioBufferSourceNode to play back the audio
//                     const sourceNode = audioCtx.createBufferSource();
//                     sourceNode.buffer = audioBuffer;
// // Set the playback rate (e.g. 2.0 for double speed)
//                     sourceNode.playbackRate.value = 1.25
// // Connect the AudioBufferSourceNode to the destination (i.e. the speakers)
//                     sourceNode.connect(audioCtx.destination);
// // Start playing the audio
//                     sourceNode.start();
    }
  }
  return (
    <div className="App">
      <h1>生きてください。</h1>
      <div>
        {SPEAKERS.map((speaker, index) => {
          return (
            <label key={index}>
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
      // console.log(await response)
      // console.log(Object.fromEntries(response.headers))
      // response.headers.forEach(console.log);
      // console.log(jsonData)
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
