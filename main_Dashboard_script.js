const AdminCreds = JSON.parse(sessionStorage.getItem("admin-creds"));

if (AdminCreds) {
    msg.innerText = `Admin with email ${AdminCreds.email} Successfully Logged In!`;
} else {
    window.location.href = 'login.html'; // Redirect to login page if no credentials found
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    showSummary();
    showTotalResBarChart();
});

// Define colors for specific response types globally
const responseColors = {
    'Excellent': 'rgba(0, 255, 0, 0.2)', // Green
    'Good': 'rgba(255, 255, 0, 0.2)', // Yellow
    'Average': 'rgba(255, 165, 0, 0.2)', // Orange
    'Bad': 'rgba(255, 0, 0, 0.2)', // Red
    'Poor': 'rgba(211, 211, 211, 0.2)' // Light ash color
};

const borderColors = {
    'Excellent': 'rgba(0, 255, 0, 1)', // Green
    'Good': 'rgba(255, 255, 0, 1)', // Yellow
    'Average': 'rgba(255, 165, 0, 1)', // Orange
    'Bad': 'rgba(255, 0, 0, 1)', // Red
    'Poor': 'rgba(211, 211, 211, 1)' // Dark ash color
};

async function showSummary() {
    const branchCodes = ['082', '700', '416', '620']; // List of all branch codes
    const totalResponses = {
        'Excellent': 0,
        'Good': 0,
        'Average': 0,
        'Bad': 0,
        'Poor': 0
    };

    const loadingSpinnerSummary = document.getElementById('loading-spinner-summary');
    loadingSpinnerSummary.style.display = 'block';

    try {
        let totalResponseCount = 0;

        // Iterate over each branch and fetch totalRespCount from respCount collection
        for (const branchCode of branchCodes) {
            const respCountRef = collection(db, `Br_in_Area/${branchCode}/respCount`);
            const respCountSnap = await getDocs(respCountRef);
            respCountSnap.forEach(docSnap => {
                const responseData = docSnap.data();
                if (responseData.count) {
                    totalResponseCount += responseData.count;
                }
            });
        }

        // Update summary card
        const summaryElement = document.getElementById('summary');
        summaryElement.innerText = `Number of Branches: ${branchCodes.length}\nTotal Responses: ${totalResponseCount}`;

        // Hide the loading spinners
        loadingSpinnerSummary.style.display = 'none';

    } catch (error) {
        console.error('Error fetching total responses:', error);
        alert('Failed to fetch total responses. Please try again later.');
    }
}

async function showTotalResBarChart() {
    const branchCodes = ['082', '700', '416', '620']; // List of all branch codes
    const totalResponses = {
        'Excellent': 0,
        'Good': 0,
        'Average': 0,
        'Bad': 0,
        'Poor': 0
    };

    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    try {
        let totalResponseCount = 0;

        // Iterate over each branch and fetch responses from all question sub-collections
        for (const branchCode of branchCodes) {
            for (let questionNumber = 1; questionNumber <= 10; questionNumber++) {
                const questionRef = collection(db, `Br_in_Area/${branchCode}/Q${questionNumber}`);
                const questionSnap = await getDocs(questionRef);
                questionSnap.forEach(docSnap => {
                    const responseData = docSnap.data();
                    for (const [response, count] of Object.entries(responseData)) {
                        if (totalResponses[response] !== undefined) {
                            totalResponses[response] += count;
                            totalResponseCount += count;
                        }
                    }
                });
            }
        }

        // Calculate percentages
        const percentages = {};
        for (const [response, count] of Object.entries(totalResponses)) {
            percentages[response] = ((count / totalResponseCount) * 100).toFixed(2);
        }

        // Prepare data for Chart.js
        const data = {
            labels: Object.keys(totalResponses),
            datasets: [{
                label: 'Total Responses',
                data: Object.values(totalResponses),
                backgroundColor: Object.keys(totalResponses).map(response => responseColors[response]),
                borderColor: Object.keys(totalResponses).map(response => borderColors[response]),
                borderWidth: 1
            }]
        };

        // Render the chart
        const ctx = document.getElementById('totalResponsesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Total Responses for Each Category Across All Branches'
                    }
                }
            }
        });

        // Display percentages
        const percentagesElement = document.getElementById('percentages');
        percentagesElement.innerHTML = Object.entries(percentages).map(([response, percentage]) => {
            return `<span><i class = "fas fa-circle"></i> ${response}: ${percentage}%</span>`;
        }).join('&nbsp;&nbsp;&nbsp;&nbsp;');

        // Hide the loading spinners
        loadingSpinner.style.display = 'none';

    } catch (error) {
        console.error('Error fetching total responses:', error);
        alert('Failed to fetch total responses. Please try again later.');
    }
}

const SignOut = () => {
    sessionStorage.removeItem("admin-creds");
    window.location.href = 'login.html';
}

document.getElementById('signOutLink').addEventListener('click', (event) => {
    event.preventDefault();
    const signOutModal = new bootstrap.Modal(document.getElementById('signOutModal'));
    signOutModal.show();
});

document.getElementById('confirmSignOut').addEventListener('click', () => {
    SignOut();
});