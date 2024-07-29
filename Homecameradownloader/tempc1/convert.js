const ffmpeg = require("ffmpeg");
try {
  new ffmpeg('./test', function (err, video) {
    if (!err) {
      console.log('The video is ready to be processed');
      video
        .save('./your_movie.avi', function (error, file) {
          if (!error){
            console.log('Video file: ' + file);
          } else {
            console.log("errror", error)
          }
        });
    } else {
      console.log('Error: ' + err);
    }
  });
} catch (e) {
  console.log(e.code);
  console.log(e.msg);
}
