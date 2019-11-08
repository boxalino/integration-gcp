# GCP Integrations - Download file from URL to Google Cloud Storage (GCS)

View the [source code][code].

[code]: ./index.js

Before continue with the tutorial, make sure you have the following data known:
1. fileUrl         - file download URL; must have public access 
2. fileFormat      - JSON or CSV
3. bucketName      - the bucket where the file is stored (ex: project-bucket)
4. filePath        - file path + file name + format (relative path) (ex: boxalino/datasync/file-to-upload.csv)


## Deployment via Cloud Functions view

1. Follow the [Cloud Functions quickstart guide] to setup Cloud
Functions for your project.

2. Create a new cloud function; give it a suggestive name (ex:  function-downloadFileToGCS)

3. Set trigger type **HTTP**

4. Select the _source code_ to **Inline Editor**

5. Use "Node.js 8" for the Runtime option

6. In index.js edit view copy-paste the [source code][code]. The following data-constants **must** be set:
- fileUrl         - file download URL; must have public access 
- fileFormat      - JSON or CSV
- bucketName      - the bucket where the file is stored
- filePath        - file path + file name + format (relative path)

7. In package.json copy the JSON definition


        {
            "name": "boxalino-gcp-download-to-gcs-from-url",
            "version": "0.0.1",
            "dependencies": {
                "@google-cloud/storage": "1.6.0"
            }
        }

8. Write the function name *downloadFileToGCS* in the text field for "Function to Execute"

9. In the advanced options, select the region **europe-west1** (same as your bucket), a reasonable timeout (60-180), and use your App Engine service account (or create a dedicated one)
    
10. Save the function by clicking on **"create"**

A deployment will start in the Cloud Functions view. If there are issues, please check your logs. Once it is confirmed that it run without any issues, you can use the trigger defined (URL) to trigger the process. (it can also be located under the _Trigger_ tab of your function view)

The trigger URL looks like: https://europe-west1-**project-id**.cloudfunctions.net/function-**function-name**

11. Open your bucket to check that the file has been downloaded successfully.

12. The created function can be triggered whenever you want to update the table; It can also be edited from the Cloud Functions view.


[Cloud Functions quickstart guide]: https://cloud.google.com/functions/docs/quickstart-console