# GCP Integrations - Load file from URL to BigQuery table

Before the code is used, the following data-constants must be updated:
1. bigqueryDataset - an existing dataset within your project 
2. bigqueryTable   - the table name to store the loaded data
3. fileUrl         - file download URL; must have public access 
4. fileFormat      - JSON or CSV
5. bucketName      - the bucket where the file is stored
6. filePath        - file path + file name + format (relative path)

View the [source code][code].

[code]: index.js

## Deployment via Cloud Functions view

1. Follow the [Cloud Functions quickstart guide] to setup Cloud
Functions for your project.

2. Create a new cloud function; give it a suggestive name (ex:  function-loadFileToBQ)

3. Set trigger type *HTTP*

4. Select the _source code_ to *Inline Editor*

5. Use "Node.js 8" for the Runtime option

5. In index.js edit view copy-paste the [source code][code] AND set the constants required

6. In package.json copy the JSON definition


        {
            "name": "boxalino-gcp-load-to-bq",
            "version": "0.0.1",
            "dependencies": {
                "@google-cloud/bigquery": "^1.3.0",
                "@google-cloud/storage": "1.6.0"
            }
        }

7. Write the function name *loadFileToBQ* in the text field for "Function to Execute"

8. In the advanced options, select the region *europee-west1* (same as your dataset), a reasonable timeout (60-180), and use your App Engine service account (unless you have created a new one)
    
9. Save the function by clicking on "create"

A deployment will start in the Cloud Functions view. Once it is confirmed that it run without any issues, you can use the trigger defined (URL) to trigger the process.
The trigger URL looks like: https://europe-west1-<project-id>.cloudfunctions.net/function-<function-name>

10. Query the BigQuery table to check that you can see that the data has been inserted successfully.


[Cloud Functions quickstart guide]: https://cloud.google.com/functions/docs/quickstart-console