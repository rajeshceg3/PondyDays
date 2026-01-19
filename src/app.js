import AppController from './modules/AppController.js';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.init();
});
