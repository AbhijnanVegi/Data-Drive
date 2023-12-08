# Testing
Given the strong coupling between the backend, MongoDB and MinIO, having unit tests for the backend would require us to mock the database and MinIO. Thus we resorted to manula testing for the backend.

While most of the endpoints are trivial to test, here are some of the edge cases we tested for:
- Copying and Moving files in and out of shared directories
- Moving shared files/directories
- Deleting shared files/directories
- Resharing files with updated permissions
- Nested shares 
- Unsharing nested shares
- All of the above with public sharing

