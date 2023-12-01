import api from './api';

/**
 * Fetches user information and updates the path and folders state.
 * @param {function} setPath - The function to update the path state.
 * @param {function} setFolders - The function to update the folders state.
 * @returns {Promise<void>} - A promise that resolves when the user information is fetched and the state is updated.
 */
const fetchUserInfo = async (setPath, setSharedPath, setFolders, setUser, setIsAdmin) => {
  try {
    const res = await api.get('/auth/user');
    if (res.data.username === null) {
      window.location.href = '/';
    } else {
      console.log("user details", res);
      setPath(res.data.username);
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
    }
  } catch (err) {
    console.error(err);
  }
};

export default fetchUserInfo;