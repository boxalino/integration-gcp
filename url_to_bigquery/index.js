'use strict';

/**
 * @TODO define your setup configurations
 */
const bigqueryDataset = '';
const bigqueryTable = '';
const fileUrl = '';
const fileFormat = ''; //JSON or CSV 
const bucketName = ''; 
const filePath = '';

/**
 * Generic re-usable constants
 */
const Storage = require('@google-cloud/storage');
const BigQuery = require('@google-cloud/bigquery');
const request = require('request');
const storage = Storage();
const bigquery = new BigQuery();
const bucket = storage.bucket(bucketName);
const gcsFile = bucket.file(filePath);


/**
 * Creates a BigQuery load job to load a file from Cloud Storage and write the data into BigQuery.
 * 1. Gets the file from the specified URL
 * 2. Uploads the file to GCS in a bucket defined for this job
 * 3. Loads the file from GCS to BQ
 * 
 * @param {Object} req request context.
 * @param {Object} res response context. 
 */
exports.loadFileToBQfromUrl = (req, res) => {
   
    console.log("Downloading file from URL");
    pipeFileToGCS();
    console.log("File downloaded");

    console.log("Retrieve metadata for BQ table update/create");
    var metadata = getMetadata();
    console.log(metadata);

    // Loads data from a Google Cloud Storage file into the table
    bigquery
        .dataset(bigqueryDataset)
        .table(bigqueryTable)
        .load(gcsFile, metadata)
        .catch(err => {
            console.error('ERROR:', err);
        });

    res.send(`Loaded from gs://${bucketName}/${filePath} into ${bigqueryDataset}.${bigqueryTable}`);
};


/**
 * Download file to GCS bucket
 * 
 * For more samples/adjustments, please check the official documentation
 * https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File
 * https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
 */
function pipeFileToGCS() {
    var type = 'application/json';
    if(fileFormat == 'CSV'){
        type = 'text/csv';
    }

    request.get(fileUrl)
    .pipe(gcsFile.createWriteStream({
        metadata: {
            resumable: false, //ONLY FOR FILES LESS THAN 10MB!
            contentType: type,
            
        }
    }))
    .on("error", (err) => {
        console.error(`Error on file download`);
    })
    .on('finish', () => {
        console.info(`File downloaded successfully`);
    });
};

/**
 * writeDisposition option will empty the table (if exists) and insert new content; 
 * More configurations options available on the official documentation
 * https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad
 */
function getMetadata() {
    switch(fileFormat) {
        case 'CSV':
            var metadata = {
                sourceFormat: 'CSV',
                skipLeadingRows: 1,
                autodetect: true,
                location: 'EU',
                fieldDelimiter: ',',
                encoding: 'UTF-8',
                writeDisposition: 'WRITE_TRUNCATE',
                allowQuotedNewlines: true
              };
          break;
        case 'JSON':
            var metadata = {
                sourceFormat: 'NEWLINE_DELIMITED_JSON',
                autodetect: true,
                encoding: 'UTF-8',
                location: 'EU',
                writeDisposition: 'WRITE_TRUNCATE'
              };
          break;
        default:
            var metadata = {
                location: 'EU',
                encoding: 'UTF-8',
                writeDisposition: 'WRITE_TRUNCATE',
                allowQuotedNewlines: true
            }
    }

    return metadata;
}