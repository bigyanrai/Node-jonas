import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
    // console.log(res);
  } catch (error) {
    showAlert('error', error.response.data.message);
    console.log('bundle check');
  }
};
// console.log(document.querySelector('.form'));

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/logout`,
    });
    if (res.data.status === 'success') {
      // location.reload(true);
      location.assign('/login');
    }
  } catch (error) {
    // console.log(error.response);
    showAlert('error', 'Error logging out');
  }
};
