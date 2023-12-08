import api from './api';

/**
 * Fetches user information and updates the path and folders state.
 * @param {function} setPath - The function to update the path state.
 * @param {function} setFolders - The function to update the folders state.
 * @returns {Promise<void>} - A promise that resolves when the user information is fetched and the state is updated.
 */
const fetchUserInfo = async (setPath, setSharedPath, setFolders, setUser, setIsAdmin, setLogin) => {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  console.log("current location", pathname)
  api.get('/auth/user')
    .then((res) => {
      console.log("user details", res);
      if (pathname === "/home") {
        setPath(res.data.username);
      }
      else {
        // remove the first character
        console.log("pathname", pathname.slice(1))
        setPath(pathname.slice(1))
      }
      setSharedPath(res.data.username);
      setUser(res.data);
      setIsAdmin(res.data.admin);
      const firstFolder = {
        id: res.data.username,
        name: res.data.username,
        isDir: true,
        isOpenable: true,
      };
      setFolders([firstFolder]);
      setLogin(true);
    })
    .catch((err) => {
      setPath(pathname.slice(1))
    });

};

export default fetchUserInfo;