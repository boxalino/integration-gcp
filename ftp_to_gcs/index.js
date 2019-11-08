'use strict';

/**
 * @TODO define your setup configurations
 */
const ftpFilePath = '';
const fileFormat = ''; //JSON or CSV 
const bucketName = ''; 
const filePath = '';
const ftpConfig = {
    host: '',
    port: 21,
    user: '',
    password: ''
};


/**
 * Download file to GCS bucket (from FTP)
 * 
 * For more samples/adjustments, please check the official documentation
 * https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File
 * https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
 * 
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.downloadFtpFileToGCS = (data, context) => {
    
    const Storage = require('@google-cloud/storage');
    const FtpClient = require('ftp');
    const storage = Storage();
    const client = new FtpClient(ftpConfig);
    const bucket  = storage.bucket(bucketName);
    const gcsFile = bucket.file(filePath);
    

    console.log("Downloading file from URL");
    if(fileFormat=='CSV')
    {
        client.on('ready', function(){
            client.get(ftpFilePath, function(err,stream){
                if (err){
                    console.log("Error on file download: " + err);
                    throw err;
                }
                stream.once('close', function(){client.end();});
                stream.pipe(gcsFile.createWriteStream({
                    metadata: {
                        resumable: false, //ONLY FOR FILES LESS THAN 10MB!
                        contentType: 'text/csv'
                    }
                }));
            });
        });

        client.connect();
    }

    if(fileFormat=='JSON')
    {
        request.get(fileUrl)
        .pipe(gcsFile.createWriteStream({
            metadata: {
                resumable: false, //ONLY FOR FILES LESS THAN 10MB!
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