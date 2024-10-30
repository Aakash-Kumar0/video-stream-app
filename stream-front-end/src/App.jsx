
import { Toaster } from 'react-hot-toast'
import './App.css'
import VideoUpload from './components/videoupload/VideoUpload'
import { useState } from 'react'
import VideoPlayer from './components/videoplayer/VideoPlayer';
import { Button, TextInput } from 'flowbite-react';

function App() {
  const [fieldValue, setFieldValue] = useState(''); // Initialize as an empty string
  const [videoId, setVideoId] = useState('b3977397-42e7-4806-8ddf-0c070fb97087');

  function playVideo(videoId) {
    setVideoId(videoId);
  }

  const handlePlayVideo = () => {
    if (fieldValue) { // Check if fieldValue is not empty
      setVideoId(fieldValue);
      setFieldValue(''); // Clear the input field after setting videoId
    } else {
      alert('Please enter a valid video ID');
    }
  };

  return (
    <>
      <Toaster />
      <div className='flex flex-col space-y-5 items-center justify-center py-9'>
        <h1 className='text-3xl font-bold text-gray-700 dark:text-gray-100'>Video Streaming Application</h1>

        <div className='flex w-full justify-around'>
          <div>
            <h1 className='text-white'>Playing Video</h1>
            <div>
              <VideoPlayer src={`http://localhost:8080/api/v1/videos/${videoId}/master.m3u8`} />
            </div>
          </div>

          <VideoUpload />
        </div>
      </div>

      <div className="my-4 flex justify-center space-x-4">
        <TextInput
          onChange={(event) => {
            setFieldValue(event.target.value); // Use onChange instead of onClick
          }}
          value={fieldValue} // Bind value to the state
          placeholder="Enter video id here"
          name="video_id_field"
        />
        <Button onClick={handlePlayVideo}> {/* Use a handler function for button click */}
          Play
        </Button>
      </div>
    </>
  );
}

export default App
