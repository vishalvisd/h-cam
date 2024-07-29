const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const {exec} = require('node:child_process');

const CAMIPs = {
    CAM1: {
        NAME: 'CAM1',
        IP: '192.168.1.31'
    },
    CAM2: {
        NAME: 'CAM2',
        IP: '192.168.1.33'
    },
    CAM3: {
        NAME: 'CAM3',
        IP: '192.168.1.35'
    }
}

const dayDate = '20240224';
const startTime = '183000';
const endTime = '183500';

// Set
const selectedCam = CAMIPs.CAM1;
const LOCALHOST = false;
const selectedCamIP = LOCALHOST ? '192.168.4.1' : selectedCam.IP;

const COMBINED_FILE_NAME = `${selectedCam.NAME}__${dayDate}__${startTime}_${endTime}`;

//Stop Recording
axios.get(`http://${selectedCamIP}/control?forceRecord=0`).then(function () {
    console.log("Stopped Recording - ");
    console.log("Waiting 5 second");
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Wait Over...");
            resolve();
        }, 5000)
    })
}).then(function (response1) {

    // Get files list for the day
// http://192.168.1.31/control?sfile=/20240209
    axios.get(`http://${selectedCamIP}/control?sfile=/${dayDate}`).then(function (response) {
        const fileList = _.slice(_.keys(response.data), 1);
        console.log(`Fetching files list successful - got ${_.size(fileList)} entries`);

        // Find required file names
        let requiredFileNames = [];
        _.forEach(fileList, filePath => {
            const [unN1, unN2, fileName] = _.split(filePath, '/');

            const [date, time] = _.split(fileName, '_');

            if (time >= startTime && time <= endTime) {
                requiredFileNames.push(filePath);
            }
        })
        console.log(`To Download: ${_.size(requiredFileNames)} files :-`, requiredFileNames);

        // Sort Filenames
        requiredFileNames = _.sortBy(requiredFileNames, filePath => {
            const [unN1, unN2, fileName] = _.split(filePath, '/');
            const [date, time] = _.split(fileName, '_');
            return time;
        });

        if (!fs.existsSync(`${COMBINED_FILE_NAME}`)) {
            fs.mkdirSync(`${COMBINED_FILE_NAME}`);
        }

        const tempFileListContent = _.reduce(requiredFileNames, (acc, filePath) => {
            const [unN1, unN2, fileName] = _.split(filePath, '/');
            return `${acc}file '${fileName}'\n`;
        }, '');
        fs.writeFileSync(`${COMBINED_FILE_NAME}/list.txt`, tempFileListContent);

        // Download one by one all the files
        let promiseChain = Promise.resolve();
        _.forEach(requiredFileNames, (filePath, index) => {

            const [unN1, unN2, fileName] = _.split(filePath, '/');

            // Check if file already exists
            const isExists = fs.existsSync(`${COMBINED_FILE_NAME}/${fileName}`);
            if (!isExists) {
                promiseChain = promiseChain.then(function () {
                    process.stdout.write(`Setting ${fileName}...  `);
                    return axios.get(`http://${selectedCamIP}/control?sfile=${filePath}`);
                }).then(function () {
                    // `http://${selectedCam}/control?download=1`
                    return new Promise(resolve => {
                        process.stdout.write(`Downloading... `);
                        exec(`wget -O ${COMBINED_FILE_NAME}/tempVid${index}.avi http://${selectedCamIP}/control?download=1`,
                            function (error, stdout, stderr) {
                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                } else {
                                    exec(`move ${COMBINED_FILE_NAME}\\tempVid${index}.avi ${COMBINED_FILE_NAME}\\${fileName}`, (err1) => {
                                        if (err1 !== null) {
                                            console.log(err1);
                                            console.log("fileDownloaded but error in moving")
                                        } else {
                                            console.log(`Downloaded ${fileName}.`);
                                        }
                                        resolve()
                                    })
                                    // Add entry to fileList file

                                }

                            });
                    });
                }).catch(err => {
                    console.log(err);
                })
            } else {
                console.log(`File ${fileName} already exists, skipped...`);
            }
        });
        promiseChain.then(() => {
            console.log("Done! all downloading");

            exec(`cd ${COMBINED_FILE_NAME} && ffmpeg -f concat -i list.txt -c copy ${COMBINED_FILE_NAME}.avi`, (err33) => {
                if (err33) {
                    console.log(err33);
                } else {
                    console.log(`Successfully combined vidoes to ${COMBINED_FILE_NAME}.avi`)
                }

                exec(`move ${COMBINED_FILE_NAME}\\${COMBINED_FILE_NAME}.avi .`, (err44, out44) => {
                    if (err44) {
                        console.log(err44);
                    }
                    fs.rmSync(COMBINED_FILE_NAME, {recursive: true, force: true});
                });
                console.log("done")
            })


        });
        return promiseChain;
    })
        .then(function () {
            console.log("Resume Recording...");
            axios.get(`http://${selectedCamIP}/control?forceRecord=1`)
        })
        .catch(function (err) {
            console.log("Error")
        })
})
