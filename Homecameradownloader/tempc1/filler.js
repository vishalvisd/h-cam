const axios = require("axios");
const fs = require('fs');
const dfns = require('date-fns');
const _ = require("lodash");

const camIPs = ["192.168.1.31", "192.168.1.33", "192.168.1.35"];
const camBuckets = [[], [], []];
const maxTime = 10 * 60 * 1000;

_.forEach(camIPs, (camIP, index) =>{
  setInterval(()=>{
    const filledBucket = _.first(camBuckets[index]);
    if (!_.isEmpty(filledBucket)){
      camBuckets[index].splice(0,1);
      const currentDateTimeString = dfns.format(new Date(), "dd_MM_yyyy__hh_mm_ss");
      fs.writeFile(`./rawVideos/cam${index+1}/${currentDateTimeString}`, Buffer.concat(filledBucket), 'binary', function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Done!");
        }
      });
    }
  }, 100);

  axios.get(`http://${camIP}`, {responseType: 'stream'}).then(response => {
    const stream = response.data;
    let startTime = new Date();
    let bucket = [];
    stream.on('data', frame => {
      const curTime = new Date();
      const timeDifference = Math.abs(curTime.getTime() - startTime.getTime());
      if (timeDifference <= maxTime) {
        bucket.push(frame);
      } else {
        camBuckets[index].push(bucket);
        bucket = [];
        startTime = new Date();
      }
    })
  }).catch((e)=>{
    console.log("axios error", e);
  })
})


