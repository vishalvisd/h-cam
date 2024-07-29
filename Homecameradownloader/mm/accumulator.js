const dfns = require("date-fns");
const _ = require("lodash");
const getVideo = require("./down");
const fs = require("fs");
const path = require("path");
const DATE_FORMAT = "dd_MM_yyyy__HH_mm_ss";

async function accumulate(camName, startTimeP, endTimeP, videoLengthMins){
  const startEndBlocks = [];
  let loopStartTimeP = startTimeP;

  while (dfns.isBefore(loopStartTimeP, endTimeP)){
    const loopEndTimeP = dfns.add(loopStartTimeP, {minutes: videoLengthMins});
    const startTime = dfns.format(loopStartTimeP, DATE_FORMAT);
    const endTime = dfns.format(loopEndTimeP, DATE_FORMAT);
    loopStartTimeP = loopEndTimeP;

    startEndBlocks.push({
      startTime,
      endTime
    })
  }

  for(let i = 0; i < startEndBlocks.length; i++){
    const block = startEndBlocks[i];
    const {startTime, endTime} = block;
    console.log(`Getting ${startTime} to ${endTime} for ${camName}`);
    await getVideo(camName, startTime, endTime)
  }

  const videoFileNameList = [];
  for(let i = 0; i < startEndBlocks.length; i++){
    const block = startEndBlocks[i];
    const {startTime, endTime} = block;
    const videoFileName = `file '${camName}-${startTime}-${endTime}.avi'`;
    videoFileNameList.push(videoFileName);
  }

  fs.writeFileSync(path.join(__dirname, "vidlist.txt"), videoFileNameList.join("\n"), "utf-8");
}

const accumulateStart = dfns.parse('16_01_2024__07_00_00', DATE_FORMAT, new Date());
const accumulateEnd = dfns.parse('16_01_2024__11_00_00', DATE_FORMAT, new Date());
const camName = "cam3";
accumulate(camName, accumulateStart, accumulateEnd, 60);
