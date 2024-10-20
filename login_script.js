import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js"



const firebaseConfig = {
    apiKey: "AIzaSyC0JLvxC286PUDwjx2oeEkhOMTr_TsYPRg",
    authDomain: "evaluationsysboc.firebaseapp.com",
    projectId: "evaluationsysboc",
    storageBucket: "evaluationsysboc.appspot.com",
    messagingSenderId: "581990176597",
    appId: "1:581990176597:web:2c5dd4ed7df2f3babc01dc",
    measurementId: "G-MZ4TLL0THZ"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);


const Email = document.getElementById('Email');
const Pw = document.getElementById('Pw');
const MainForm = document.getElementById('MainForm');


let signInAdmin = evt => {
    evt.preventDefault();

    signInWithEmailAndPassword(auth, Email.value, Pw.value)
        .then((credentials) => {
            sessionStorage.setItem("admin-creds", JSON.stringify(credentials.user));
            window.location.href = 'Main_Dashboard.html';
        })
        .catch((error) => {
            alert(error.message);
            console.log(error.code);
            console.log(error.message);
        })


}

MainForm.addEventListener('submit', signInAdmin);