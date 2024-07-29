const dfns = require("date-fns");
const _ = require("lodash");
const { exec } = require('node:child_process');
const path = require("path");

const DATE_FORMAT = "dd_MM_yyyy__hh_mm_ss_bbb";
const FILE_FORMAT = "avi";
const STORAGE_PATH = "/media/parntfs/homecamera/convertedVideos";

const getVideo = (camName, startTime, endTime) => new Promise((resolve)=>{
 let startTimeP = dfns.parse(startTime, DATE_FORMAT, new Date());
 const endTimeP = dfns.parse(endTime, DATE_FORMAT, new Date());

 let commands = ""

 while (dfns.isBefore(startTimeP, endTimeP) || dfns.isEqual(startTimeP, endTimeP)){
  const fileName = `${dfns.format(startTimeP, DATE_FORMAT)}.${FILE_FORMAT}`;
  const fullFilePath = `${STORAGE_PATH}/${camName}/${fileName}`;

  commands += `get ${fullFilePath};`;

  startTimeP = dfns.add(startTimeP, {seconds: 1});
 }

 const finalCommand = `lftp sftp://visd:visdnick@192.168.1.30  -e  "${commands} bye"`;

 const OUTPUT_LOCATION = path.join(__dirname, "output");

 const outputFolder = `${camName}-${startTime}-${endTime}`;
 exec(`cd ${OUTPUT_LOCATION} && mkdir ${outputFolder} && cd ${outputFolder}`, (err1, out1)=>{
  if (err1){
   resolve();
   throw err1;
  }

  const filesOutputLocation = path.join(OUTPUT_LOCATION, outputFolder);
  exec(`cd ${filesOutputLocation} && ${finalCommand}`, (err11, out11)=>{

   console.log("Concatenating files using ffmpeg...");

   exec(`cd ${filesOutputLocation} && ls *.avi | while read each; do echo "file '$each'" >> videolist.txt; done`, (err3, out3)=>{
    if (err3){
     console.log(err3);
    }
    exec(`cd ${filesOutputLocation} && ffmpeg -f concat -i videolist.txt -c copy ${outputFolder}.avi`, (err33, out33)=>{
     if (err33){
      console.log(err33);
     } else {
      console.log("Successfully done!")
     }

     exec(`cp ${filesOutputLocation}/${outputFolder}.avi ${OUTPUT_LOCATION} && rm -rf ${filesOutputLocation}`, (err44, out44)=>{
      if(err44){
       console.log(err44);
       resolve();
      } else {
       resolve();
      }
     });
     console.log("done")
    })
   })
  })
 })
})



// getVideo("cam2", "06_09_2023__10_00_00_am", "06_09_2023__11_59_00_am").then(()=>{
//  console.log("visd done");
//
// });
module.exports = getVideo;
// getVideo("cam2", "08_08_2023__10_40_00_am", "08_08_2023__10_42_00_am");
// getVideo("cam3", "13_08_2023__6_00_00_pm", "13_08_2023__6_01_00_pm");
