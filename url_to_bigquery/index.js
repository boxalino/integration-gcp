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
 * For more samples/adjustments, please check the official documentation
 * https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File
 * https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
 * https://googleapis.dev/nodejs/storage/latest/File.html
 *
 * @param {Object} req request context.
 * @param {Object} res response context.
 */
exports.loadFileToBQfromUrl = (req, res) => {

    var type = 'application/json';
    if(fileFormat == 'CSV'){
        type = 'text/csv';
    }

    request.get(fileUrl)
        .pipe(gcsFile.createWriteStream({
            //customize the metadata for the gcs stream
            //https://googleapis.dev/nodejs/storage/latest/File.html
            metadata: {
                contentType: type
            }
        }))
        .on("error", (err) => {
            console.error("Error on file download");
            res.send("The is an issue processing your request. Please check the logs.");
        })
        .on('finish', () => {
            console.info("File downloaded successfully to the GCS bucket.");
            console.log("Loading the file from " + fileUrl);
            // Loads data from a Google Cloud Storage file into the table
            let metadata = getMetadata();
            bigquery
                .dataset(bigqueryDataset)
                .table(bigqueryTable)
                .load(gcsFile, metadata)
                .catch(err => {
                    console.error('ERROR:', err);
                });

            res.send(`Loaded from gs://${bucketName}/${filePath} into ${bigqueryDataset}.${bigqueryTable}`);
        });
};

/**
 * writeDisposition option will empty the table (if exists) and insert new content;
 *
 * More configurations options available on the official documentation
 * https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad
 */
function getMetadata() {
    switch(fileFormat) {
        case 'CSV':
            return {
                sourceFormat: 'CSV',
                skipLeadingRows: 1,
                autodetect: true,
                location: 'EU',
                fieldDelimiter: ',',
                encoding: 'UTF-8',
                writeDisposition: 'WRITE_TRUNCATE',
                allowQuotedNewlines: true
            };
        case 'JSON':
            return {
                sourceFormat: 'NEWLINE_DELIMITED_JSON',
                autodetect: true,
                encoding: 'UTF-8',
                location: 'EU',
                writeDisposition: 'WRITE_TRUNCATE'
            };
        default:
            return {
                location: 'EU',
                encoding: 'UTF-8',
                writeDisposition: 'WRITE_TRUNCATE',
                allowQuotedNewlines: true
            }
    }

}