const fs = require('fs');
const path = require('path');
const { exec } = require('node:child_process');
const _ = require("lodash");

const PATH_TO_VIDEO_STORAGE = "/media/parntfs/homecamera";

function processFile(rawFilePath, processFilePath){
  processFilePath = processFilePath + ".avi";
  return new Promise((resolve, reject)=>{
    exec(`ffmpeg -y -i ${rawFilePath} -c:v libvpx ${processFilePath}`, (err, output) => {
      if (err){
        console.log("Processing error - ", rawFilePath, err);
      } else {
        console.log("Raw video processed successfully - ", rawFilePath, output);
      }
      // Delete the raw video file
      exec(`rm ${rawFilePath}`, (err1, output1) => {
        if (err1){
          console.log("Error deleting file - ", rawFilePath, err1);
          resolve(false);
        } else {
          console.log("Deleted Raw video successfully - ", rawFilePath, output1);
          resolve(true);
        }
      })
    })

  })
}

async function pp(){
  while(true){
    let cam = "cam1";
    let RAW_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "rawVideos", cam);
    let PROCESSED_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "convertedVideos", cam);
    // Read Raw Video Folder directory
    let files = fs.readdirSync(RAW_VIDEO_FOLDER);
    if (!_.isEmpty(files)){
      // Pick the first file
      const fileToProcessName = files[0];
      const rawFilePath = path.join(RAW_VIDEO_FOLDER, fileToProcessName);
      const processFilePath = path.join(PROCESSED_VIDEO_FOLDER, `${fileToProcessName}`);
      await processFile(rawFilePath, processFilePath).then((res)=>{
        if (res){
          console.log(`Processing successfully ${fileToProcessName}`)
        } else {
          console.log(`Processing successfully ${fileToProcessName}, but failed to delete file`)
        }
      }).catch((err)=>{
        console.log(`Processing error ${fileToProcessName}`, err)
      });
    }

    cam = "cam2";
    RAW_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "rawVideos", cam);
    PROCESSED_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "convertedVideos", cam);
    // Read Raw Video Folder directory
    files = fs.readdirSync(RAW_VIDEO_FOLDER);
    if (!_.isEmpty(files)){
      // Pick the first file
      const fileToProcessName = files[0];
      const rawFilePath = path.join(RAW_VIDEO_FOLDER, fileToProcessName);
      const processFilePath = path.join(PROCESSED_VIDEO_FOLDER, `${fileToProcessName}`);
      await processFile(rawFilePath, processFilePath).then((res)=>{
        if (res){
          console.log(`Processing successfully ${rawFilePath}`)
        } else {
          console.log(`Processing successfully ${rawFilePath}, but failed to delete file`)
        }
      }).catch((err)=>{
        console.log(`Processing error ${rawFilePath}`, err)
      });
    }

    cam = "cam3";
    RAW_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "rawVideos", cam);
    PROCESSED_VIDEO_FOLDER = path.join(PATH_TO_VIDEO_STORAGE, "convertedVideos", cam);
    // Read Raw Video Folder directory
    files = fs.readdirSync(RAW_VIDEO_FOLDER);
    if (!_.isEmpty(files)){
      // Pick the first file
      const fileToProcessName = files[0];
      const rawFilePath = path.join(RAW_VIDEO_FOLDER, fileToProcessName);
      const processFilePath = path.join(PROCESSED_VIDEO_FOLDER, `${fileToProcessName}`);
      await processFile(rawFilePath, processFilePath).then((res)=>{
        if (res){
          console.log(`Processing successfully ${rawFilePath}`)
        } else {
          console.log(`Processing successfully ${rawFilePath}, but failed to delete file`)
        }
      }).catch((err)=>{
        console.log(`Processing error ${rawFilePath}`, err)
      });
    }
  }
}

pp()
