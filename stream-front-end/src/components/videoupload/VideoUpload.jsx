import {
  Alert,
  Button,
  Card,
  Label,
  TextInput,
  Textarea,
} from "flowbite-react";
import { Progress } from "flowbite-react";
import videologo from "../../assets/videoUpload.png";
import { useState } from "react";
import axios from "axios";
import "flowbite/dist/flowbite.css";
import toast from "react-hot-toast";

function VideoUpload() {
  const [selectFile, setSelectFile] = useState(null);
  const [meta, setMeta] = useState({
    title: "",
    description: "",
  });
  const [progress, setProgres] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event) {
    console.log(event.target.files[0]);
    setSelectFile(event.target.files[0]);
  }

  function formFieldChange(event) {
    setMeta({
      ...meta,
      [event.target.name]: event.target.value,
    });
  }

  function handleForm(formEvent) {
    formEvent.preventDefault();

    if (!selectFile) {
      alert("Please! select file");
      return;
    }

    // submit the file to server:

    saveVideoToServer(selectFile, meta);
  }

  function resetForm() {
    setMeta({
      title: "",
      description: "",
    });
    setSelectFile(null);
    setUploading(false);
  }

  // submit file to server:

  async function saveVideoToServer(video, videoMetaData) {
    setUploading(true);

    // api call

    try {
      let formData = new FormData();
      formData.append("title", videoMetaData.title);
      formData.append("description", videoMetaData.description);
      formData.append("file", selectFile);

      let response = await axios.post(`http://localhost:8080/api/v1/videos`, formData, {
        header: {
          "Content-type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progres = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          console.log(progres);
          setProgres(progres);
        },
      });
      

      setMessage("file uploaded " + response.data.videoId);
      setUploading(false);
      toast.success("File Uploaded Successfully !!");
      resetForm();
    } catch (error) {
      console.log(error);
      setMessage("error in uploading file");
      setUploading(false);
      toast.error("File not uploaded !!");
    }
  }

  return (
    <div className="text-white">
      <Card>
        <h1>Upload Videos</h1>
        <div>
          <form noValidate onSubmit={handleForm} className="space-y-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title" value="Video Title" />
              </div>
              <TextInput
                value={meta.title}
                onChange={formFieldChange}
                id="title"
                name="title"
                placeholder="Enter Tilte"
                required
              />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="description" value="Video Description" />
              </div>
              <Textarea
                value={meta.description}
                onChange={formFieldChange}
                id="description"
                name="description"
                placeholder="Write Video Description..."
                required
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-5 justify-center">
              <div className="shrink-0">
                <img className="h-12 w-12 object-cover " src={videologo} />
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  name="file"
                  onChange={handleFileChange}
                  type="file"
                  className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100
                        "
                />
              </label>
            </div>

            <div>
              {uploading && (
                <Progress
                  progress={progress}
                  textLabel="Uploading"
                  size={"lg"}
                  labelProgress
                  labelText
                ></Progress>
              )}
            </div>

            <div>
              {message && (
                <Alert
                  color={"success"}
                  rounded
                  withBorderAccent
                  onDismiss={() => {
                    setMessage("");
                  }}
                >
                  <span className="font-medium">Success alert! </span> {message}
                </Alert>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                disabled={uploading}
                onClickclassName="cursor-pointer"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default VideoUpload;
