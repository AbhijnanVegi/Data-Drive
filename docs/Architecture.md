# Server Architecture
The backend api docs are available at `/docs` and `/redoc` endpoints.  
MongoDB is used as the database and the schemas are available [here](/backend/models/)  
The backend server is responsible for maintaining user sessions and file upload/download. 
## User authentication
Users are authenticated using the same credentials as registered on the Data Foundation Systems website. To allow this, the username and password sent to the backend server are forwarded to the Data Foundation Systems server for authentication. If the credentials are valid, the backend server generates a JWT token and stores it in a HTTPOnly Cookie. This token is refreshed whenever the token is close to expiry, allowing the user to stay logged in while also making sure that the token is not valid for too long.  
Whenever a new user logs into the system, a new user is created in the database with defaults set by the administrator. 

## File Management
Every file uploaded is temporarily stored in the backend till its uploaded to MinIO and is deleted once the file is deleted.  
The advantages of this approach is that it allows us to perform file validation and other pre processing before uploading the file to MinIO. This could be tasks such as unzipping files, converting files to different formats or performing virus checks on the uploaded files. The downside of this approach is that it requires additional storage space on the server.

A similar approach is taken for downloads as well, however this time having the files downloaded to the server is necessary since we will be zipping the file together before sending it to the user. This allows us to send multiple files to the user in a single request.
> Note: The download process to the server from MinIO is done in the background using fastapi background tasks. This is done to prevent the server from being blocked while the file is being downloaded. 

Associated with every file is an entry in the database which contains the metadata data of the file and also allows us to create relations between files and users for sharing files. To enable sharing, for every share that is created a new entry of type `SharedFile` is created in the database that contains the file id, user id and the permissions granted to the user. In case directories are shared, one entry is created for each file in the directory. Thus the cardinality of the `SharedFile` table is `n*m` where `n` is the number of files in the directory and `m` is the number of users the directory is shared with.

To support public file sharing, there is a field in the `File` table called `public` which is set to true if the file is shared publicly. This allows us to easily query for all the files that are shared publicly.

Copying and Moving files is also challenge when it comes to maintaining the shares and permissions. Every time a file is copied or moved its shares get refreshed based on how the file was initially shared.

## Administration
User quotas and permissions are handled by fields in the `User` table, that track the quota used and the permission level of the user. The admin can change these values for each user.  
To change defaults for all new users, we use dynaconf that allows use to read and write configuration files at runtime. This allows us to change the default values without restarting the server.

## Space conservation
Since we store files on the server before sending them to the user, it is essential for us to clean up the files after they are downloaded. To do this, we use a background task that runs every 5 minutes and deletes all files that are expected to be downloaded using a heuristic function. The function calculates the time it would take to download a file given the file size and the minimum bandwidth a user is expected to have and determines if it has expired. If it has expired, the file is deleted. This allows us to keep the server clean and also prevents the server from running out of space.
