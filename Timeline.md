# Timeline 

## Mid - Evals 
We had completed uploading, downloading and deleting files from the server. We had also completed the basic UI framework for the application. 
We had also completed the basic authentication and authorization for the application. This was using Flask as the backend and ReactJS as the frontend.
Sharing had been implemented in backend but not in frontend.

## End - Evals
We had completed the entire application. We had also completed the documentation and the presentation. We had also completed the testing of the application.
We added a lot of features to the application like file sharing, file system manipulation, etc. We also added the ability to visualize files in the application itself.
We also added the ability to copy and move files from one folder to another. We also added the ability to copy and move files from one folder to another.
We also included the ability to download multiple files at once. We also added the cleanup task for the expired files. We also migrated the backend from Flask to FastAPI as suggested by the mentors.

## Challenges 
### Conserving server space during download
* To serve data to the user, the data must first be downloaded from MinIO to the server. Thus not cleaning this space up regularly can lead to server failures due to insufficient storage.
* To remedy this, we firstly create background download jobs for each download task.
* We then estimate the amount of the time the file will be required on the server heuristically and clean up the file once that amount of time has passed.

### Sharing files
* Implementing sharing involves a lot of conflicting edge cases and even more when you add copy and move transactions.
* While performing move and copy operations we have to make sure appropriate existing shares are invalidated and new appropriate shares are added properly. 
* Handling nested shares was also a challenging problem. 