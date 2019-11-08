'use strict';

/**
 * @TODO define your setup configurations
 */
const fileUrl = '';
const fileFormat = ''; //JSON or CSV 
const bucketName = ''; 
const filePath = '';


/**
 * Download file to GCS bucket
 * 
 * For more samples/adjustments, please check the official documentation
 * https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File
 * https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
 * 
 * @param {Object} req request context.
 * @param {Object} res response context. 
 */
exports.downloadFileToGCS = (req, res) => {
    
    /**
     * GCP elements
     */
    const Storage = require('@google-cloud/storage');
    const request = require('request');
    const storage = Storage();
    const bucket  = storage.bucket(bucketName);
    const gcsFile = bucket.file(filePath);

    console.log("Downloading file from URL");
    var type = 'application/json';
    if(fileFormat == 'CSV'){
        type = 'text/csv';
    }

    request.get(fileUrl)
    .pipe(gcsFile.createWriteStream({
        metadata: {
            resumable: false, //ONLY FOR FILES LESS THAN 10MB!
            contentType: type
        }
    }))
    .on("error", (err) => {
        console.error(`Error on file download`);
    })
    .on('finish', () => {
        console.info(`File downloaded successfully`);
    });

    console.log("File downloaded");
    res.send("Finish execution");
};