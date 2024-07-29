const axios = require("axios");
const fs = require('fs');
const path = require('path');
const dfns = require('date-fns');
const _ = require("lodash");
// const express = require("express");
// const app = express();

const PATH_TO_VIDEO_STORAGE = "/media/parntfs/homecamera/rawVideos";
const FILE_NAME_FORMAT = "dd_MM_yyyy__HH_mm_ss";
const maxTime = 15 * 1000;


function getCurrentTime(){
  return dfns.format(new Date(), FILE_NAME_FORMAT);
}

const cam1Handler = async ()=>{
  const camIP = "192.168.1.31";
  const camBucket = [];

  const intervalHandle = setInterval(()=>{
    const filledBucket = _.first(camBucket);
    if (!_.isEmpty(filledBucket)){
      camBucket.splice(0,1);
      const currentDateTimeString = getCurrentTime();
      const pathToFile = path.join(PATH_TO_VIDEO_STORAGE, "cam1", currentDateTimeString);
      fs.writeFile(pathToFile, Buffer.concat(filledBucket), 'binary', function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Done! cam1");
        }
      });
    }
  }, 100);

  let stream;
  axios.get(`http://${camIP}`, {responseType: 'stream'}).then(response => {
    console.log(`Connected to ${camIP}`);
    stream = response.data;
    // cam1Stream = stream;
    let startTime = new Date();
    let bucket = [];
    stream.on('header', function(statusCode, headers) {
      console.log("statusCode", statusCode, "headers", headers);
    });
    stream.on('data', frame => {
      const curTime = new Date();
      const timeDifference = Math.abs(curTime.getTime() - startTime.getTime());
      if (timeDifference <= maxTime) {
        bucket.push(frame);
      } else {
        camBucket.push(bucket);
        bucket = [];
        startTime = new Date();
      }
    })
    stream.on('error', err =>{
      console.log(camIP, "stream error ", err);
      clearInterval(intervalHandle);
      stream.destroy();
      cam1Handler();
    })
  }).catch((e)=>{
    console.log(camIP, "axios error");
    clearInterval(intervalHandle);
    try {
      stream.destroy();
    } catch (e) {}
    cam1Handler();
  })
}

const cam2Handler = async ()=>{
  const camIP = "192.168.1.33";
  const camBucket = [];

  const intervalHandle = setInterval(()=>{
    const filledBucket = _.first(camBucket);
    if (!_.isEmpty(filledBucket)){
      camBucket.splice(0,1);
      const currentDateTimeString = getCurrentTime();
      const pathToFile = path.join(PATH_TO_VIDEO_STORAGE, "cam2", currentDateTimeString);
      fs.writeFile(pathToFile, Buffer.concat(filledBucket), 'binary', function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Done! cam2");
        }
      });
    }
  }, 100);

  let stream;
  axios.get(`http://${camIP}`, {responseType: 'stream'}).then(response => {
    console.log(`Connected to ${camIP}`);
    stream = response.data;
    let startTime = new Date();
    let bucket = [];
    stream.on('data', frame => {
      const curTime = new Date();
      const timeDifference = Math.abs(curTime.getTime() - startTime.getTime());
      if (timeDifference <= maxTime) {
        bucket.push(frame);
      } else {
        camBucket.push(bucket);
        bucket = [];
        startTime = new Date();
      }
    })
    stream.on('error', err =>{
      console.log(camIP, "stream error ", err);
      clearInterval(intervalHandle);
      try {
        stream.destroy();
      }catch (e){}
      cam2Handler();
    })
  }).catch((e)=>{
    console.log(camIP, "axios error");
    clearInterval(intervalHandle);
    try {
      stream.destroy();
    } catch (e) {}
    cam2Handler();
  })
}

const cam3Handler = async ()=>{
  const camIP = "192.168.1.35";
  const camBucket = [];

  const intervalHandle = setInterval(()=>{
    const filledBucket = _.first(camBucket);
    if (!_.isEmpty(filledBucket)){
      camBucket.splice(0,1);
      const currentDateTimeString = getCurrentTime();
      const pathToFile = path.join(PATH_TO_VIDEO_STORAGE, "cam3", currentDateTimeString);
      fs.writeFile(pathToFile, Buffer.concat(filledBucket), 'binary', function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Done! cam3");
        }
      });
    }
  }, 100);

  let stream;

  axios.get(`http://${camIP}`, {responseType: 'stream'}).then(response => {
    console.log(`Connected to ${camIP}`);
    stream = response.data;
    let startTime = new Date();
    let bucket = [];
    stream.on('data', frame => {
      const curTime = new Date();
      const timeDifference = Math.abs(curTime.getTime() - startTime.getTime());
      if (timeDifference <= maxTime) {
        bucket.push(frame);
      } else {
        camBucket.push(bucket);
        bucket = [];
        startTime = new Date();
      }
    })
    stream.on('error', err =>{
      console.log(camIP, "stream error ", err);
      clearInterval(intervalHandle);
      try {
        stream.destroy();
      }catch (e){}

      cam3Handler();
    })

  }).catch((e)=>{
    console.log(camIP, "axios error");
    clearInterval(intervalHandle);
    try {
      stream.destroy();
    } catch (e) {}
    cam3Handler();
  })
}

cam1Handler();
cam2Handler();
cam3Handler();
//
//
// app.get("/video", function (req, res) {
//   // const headers = {
//   //   "Content-Type": "video/mp4",
//   // };
//   //
//   // // HTTP Status 206 for Partial Content
//   // res.writeHead(206, headers);
//
//   cam1Stream.pipe(res);
// });
//
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });
//
// app.listen(8000, function () {
//   console.log("Listening on port 8000!");
// });