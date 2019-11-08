'use strict';

/**
 * @TODO define your setup configurations
 */
const bigqueryDataset = '';
const bigqueryTable = '';
const ftpFilePath = '';
const fileFormat = ''; //JSON or CSV 
const bucketName = ''; 
const gcsFilePath = '';
const ftpConfig = {
    host: '',
    port: 21,
    user: '',
    password: ''
};

/**
 * Generic event constants
 */
const Storage = require('@google-cloud/storage');
const BigQuery = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const FtpClient = require('ftp');
const storage = Storage();
const client = new FtpClient();
const bucket  = storage.bucket(bucketName);
const gcsFile = bucket.file(gcsFilePath);


/**
 * Creates a BigQuery load job to download a file from FTP and import the content to BigQuery
 * 1. Gets the file from the configured FTP
 * 2. Uploads the file to GCS in a bucket defined for this job
 * 3. Loads the file from GCS to BQ
 * 
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.loadFTPFileToBQ = (data, context) => {

    pipeFileToGCS();

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

    console.log(`Loading from gs://${bucketName}/${gcsFilePath} into ${bigqueryDataset}.${bigqueryTable}`);
};

/**
 * Download FTP file to GCS bucket
 * 
 * For more samples/adjustments, please check the official documentation
 * https://cloud.google.com/nodejs/docs/reference/storage/1.3.x/File
 * https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
 */
function pipeFileToGCS() {
    console.log("Downloading file from FTP");

    var type = 'application/json';
    if(fileFormat == 'CSV'){
        type = 'text/csv';
    }

    client.on('ready', function(){
        client.get(ftpFilePath, function(err,stream){
            if (err){
                console.log("Error on file download: " + err);
                client.end()
                throw err;
            }
            stream.once('close', function(){client.end();});
            stream.pipe(gcsFile.createWriteStream({
                metadata: {
                    resumable: false, //ONLY FOR FILES LESS THAN 10MB!
                    contentType: type
                }
            }));
        });

        client.end();
        console.log("FTP Connection closed;");
    });

    client.connect(ftpConfig);
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