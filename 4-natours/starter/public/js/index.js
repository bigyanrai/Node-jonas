import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leaflet';

//DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

//DELEGATION

if (mapBox) {
  const locations = document.getElementById('map').dataset.locations;
  displayMap(locations);
}

if (loginForm) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    //VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
