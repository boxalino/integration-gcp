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
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.downloadFileToGCS = (data, context) => {
    
    /**
     * GCP elements
     */
    const Storage = require('@google-cloud/storage');
    const request = require('request');
    const storage = Storage();
    const bucket  = storage.bucket(bucketName);
    const gcsFile = bucket.file(filePath);

    console.log("Downloading file from URL");
    if(fileFormat=='CSV')
    {
        request.get(fileUrl)
        .pipe(gcsFile.createWriteStream({
            metadata: {
                contentType: 'text/csv'
            }
        }))
        .on("error", (err) => {
            console.error(`Error on file download`);
        })
        .on('finish', () => {
            console.info(`File downloaded successfully`);
        });
    }

    if(fileFormat=='JSON')
    {
        request.get(fileUrl)
        .pipe(gcsFile.createWriteStream({
            metadata: {
                contentType: 'application/json'
            }
        }))
        .on("error", (err) => {
            console.error(`Error on file download`);
        })
        .on('finish', () => {
            console.info(`File downloaded successfully`);
        });
    }      

    console.log("File downloaded");
};