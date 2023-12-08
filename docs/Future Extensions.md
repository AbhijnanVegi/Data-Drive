# Extending the Data Drive
The architecture of the data drive is built to easily extend support to various kinds of file viewers, data preprocessing and error handling. We will discuss each of these in detail below.

## File Viewers
Additional File Viewers can be made by doing the following 
- Create a new modal component in the `components/` folder, this will house the code for the component
- Import the component into both your `CustomFileBrowser.js` and `SharedFileBrowser.js` files
- Add the `ismodalopen` and `setIsModalOpen` of the state as props.
- In the `useCallback` function inside `HomePage.js` add another `if` condition which handles the particular extension and open it.

## Data Preprocessing and pipelining
A data pipeline can be easily built using the background tasks framework of FastAPI. Currently there is no data pre processing involved except for basic validation checks. However a data pipeline can be easily built by adding background tasks in a pipelined fashion and associating a job with them that can be tracked by the user. This allows us to perform complex data processing on the server side without blocking the server.

## Error Handling
With the introduction of Background Tasks, the system must also be able to handle asynchronous errors and alert the users regarding it. This can be done by adding a notifications framework that alerts the users of failed jobs.

## Notifications
The notification framework we discussed earlier can also come in handy to support a number of other features such as:
- Alerting the user when a file is shared with them
- Requesting access to a file
- Alerting user when a file has been modified/deleted by another user