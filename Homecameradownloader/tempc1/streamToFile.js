const axios = require("axios");
const fs = require('fs');
const { Readable } = require('stream');
var ffmpeg = require('ffmpeg');


const buffer = [];

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

//
setTimeout(()=>{
  console.log("kill request")
  source.cancel('Kill Request!');
  // webmReadable.push(null);
  // const outputWebmStream = fs.createWriteStream('./bunny.webm', {flags: 'a'});
  // outputWebmStream.write(Buffer.concat(buffer));
  // webmReadable.pipe(outputWebmStream);
  //
  fs.writeFile("./test", Buffer.concat(buffer), 'binary',function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Done!");
    }
  });
}, 10*60000)


axios.get(`http://192.168.1.33`, {
  responseType: 'stream',
  cancelToken: source.token
}).then((response)=>{
  const stream = response.data
  stream.on('data', data => {
    console.log(data);
    // data = data.toString()
    // webmReadable.push(data);
    buffer.push(data);
    console.log("buffer pushed")
  })
})

