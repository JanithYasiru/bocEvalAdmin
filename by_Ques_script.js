const AdminCreds = JSON.parse(sessionStorage.getItem("admin-creds"));

if (AdminCreds) {
    msg.innerText = `Admin with email ${AdminCreds.email} Successfully Logged In!`;

} else {
    window.location.href = 'login.html'; // Redirect to login page if no credentials found
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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

let questionNumber;
document.getElementById('question-select').addEventListener('change', function () {
    questionNumber = this.value;
    if (questionNumber) {
        showBranchResponses(questionNumber);
    }
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

let overallResponses = { 'Excellent': 0, 'Good': 0, 'Average': 0, 'Bad': 0, 'Poor': 0 };

async function showBranchResponses(questionNumber) {
    const branchResponsesContainer = document.getElementById('branch-responses-container');
    const branchCodes = ['082', '700', '416', '620']; // List of all branch codes

    // Clear previous branch responses
    branchResponsesContainer.innerHTML = '';
    branchResponsesContainer.style.display = 'none';

    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    try {
        // Reset overall responses for the selected question
        overallResponses = { 'Excellent': 0, 'Good': 0, 'Average': 0, 'Bad': 0, 'Poor': 0 };

        // Fetch responses for each branch
        for (const branchCode of branchCodes) {
            const branchRef = collection(db, `Br_in_Area/${branchCode}/Q${questionNumber}`);
            const branchSnap = await getDocs(branchRef);
            const responses = {};
            branchSnap.forEach(docSnap => {
                const responseData = docSnap.data();
                for (const [response, count] of Object.entries(responseData)) {
                    if (responses[response]) {
                        responses[response] += count;
                    } else {
                        responses[response] = count;
                    }
                    // Add to overall responses
                    if (overallResponses[response] !== undefined) {
                        overallResponses[response] += count;
                    }
                }
            });

            // Create a card for each branch
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card mb-3 custom-card col-md-6'; // Add custom-card class
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            cardDiv.appendChild(cardBody);

            // Add card title
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.innerText = `Branch ${branchCode} Responses for Question ${questionNumber}:`;
            cardBody.appendChild(cardTitle);

            // Add canvas for the pie chart
            const canvas = document.createElement('canvas');
            canvas.id = `branchChart${branchCode}-Q${questionNumber}`;
            cardBody.appendChild(canvas);

            // Add list of responses below the pie chart
            const responseList = document.createElement('ul');
            const orderedResponses = ['Excellent', 'Good', 'Average', 'Bad', 'Poor']; // Specify the order

            orderedResponses.forEach(response => {
                if (responses[response] !== undefined) {
                    const listItem = document.createElement('li');
                    listItem.innerText = `${response}: ${responses[response]}`;
                    responseList.appendChild(listItem);
                }
            });

            cardBody.appendChild(responseList);

            branchResponsesContainer.appendChild(cardDiv);

            // Prepare data for the pie chart
            const labels = Object.keys(responses);
            const data = Object.values(responses);

            // Map responses to custom colors
            const backgroundColors = labels.map(label => responseColors[label] || 'rgba(200, 200, 200, 0.2)');
            const borderColorsList = labels.map(label => borderColors[label] || 'rgba(200, 200, 200, 1)');

            // Create the pie chart
            new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColorsList,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: `Branch ${branchCode} Responses for Question ${questionNumber}`
                        }
                    },
                    hover: {
                        mode: null, // Disable hover mode
                        animationDuration: 0 // Disable hover animation
                    }
                }
            });
        }

        // After collecting branch responses, create overall feedback chart
        createOverallFeedbackChart(questionNumber);

        // Hide the loading spinner and show the container
        loadingSpinner.style.display = 'none';
        branchResponsesContainer.style.display = 'flex';
        branchResponsesContainer.style.flexWrap = 'wrap';

    } catch (error) {
        console.error('Error fetching branch responses:', error);
        alert('Failed to fetch branch responses. Please try again later.');
    }
}

function createOverallFeedbackChart(questionNumber) {
    const branchResponsesContainer = document.getElementById('branch-responses-container');

    // Create a card for overall feedback
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card mb-3 custom-card-overall col-md-12'; // Full width for overall chart
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardDiv.appendChild(cardBody);

    // Add card title
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.innerText = `Overall Responses for Question ${questionNumber}:`;
    cardBody.appendChild(cardTitle);

    // Add canvas for the pie chart
    const canvas = document.createElement('canvas');
    canvas.id = `overallChart-Q${questionNumber}`;
    cardBody.appendChild(canvas);

    // Prepare data for the pie chart
    const labels = Object.keys(overallResponses);
    const data = Object.values(overallResponses);

    // Map responses to custom colors
    const backgroundColors = labels.map(label => responseColors[label] || 'rgba(200, 200, 200, 0.2)');
    const borderColorsList = labels.map(label => borderColors[label] || 'rgba(200, 200, 200, 1)');

    // Create the pie chart
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColorsList,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Overall Responses for Question ${questionNumber}`
                }
            },
            hover: {
                mode: null, // Disable hover mode
                animationDuration: 0 // Disable hover animation
            }
        }
    });

    // Add list of responses below the pie chart
    const responseList = document.createElement('ul');
    const orderedResponses = ['Excellent', 'Good', 'Average', 'Bad', 'Poor']; // Specify the order

    orderedResponses.forEach(response => {
        if (overallResponses[response] !== undefined) {
            const listItem = document.createElement('li');
            listItem.innerText = `${response}: ${overallResponses[response]}`;
            responseList.appendChild(listItem);
        }
    });

    cardBody.appendChild(responseList);  // Append the response list to the card body

    // Append the overall feedback card to the branch responses container
    branchResponsesContainer.appendChild(cardDiv);
}


const SignOut = () => {
    sessionStorage.removeItem("admin-creds");
    window.location.href = 'index.html';
}

document.getElementById('signOutLink').addEventListener('click', (event) => {
    event.preventDefault();
    const signOutModal = new bootstrap.Modal(document.getElementById('signOutModal'));
    signOutModal.show();
});

document.getElementById('confirmSignOut').addEventListener('click', () => {
    SignOut();
});

document.getElementById('generate-report-btn').addEventListener('click', generateReport);

async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const branchName = document.getElementById('question-select').options[document.getElementById('question-select').selectedIndex].text;
    const currentDate = new Date().toLocaleString(); // Get current date and time

    // Set up PDF document header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Bank Of Ceylon - Customer Experience Evaluations`, 10, 15);

    doc.setFontSize(13);
    doc.text(`(Summary by Questions)`, 10, 21);

    doc.setFont("Helvetica", "normal");


    let yOffset = 45; // Initial y-offset for the charts

    // Add the overall feedback chart first
    const overallChartCanvas = document.getElementById(`overallChart-Q${questionNumber}`);
    if (overallChartCanvas) {
        const overallChartImage = await html2canvas(overallChartCanvas, { scale: 4 });
        const overallChartData = overallChartImage.toDataURL('image/png');
        doc.addImage(overallChartData, 'PNG', 10, yOffset, 70, 70);

        // Add some spacing after the overall chart
        yOffset += 25;

        // Add overall feedback response list
        const overallResponsesList = Array.from(document.querySelector(`#overallChart-Q${questionNumber}`).nextSibling.children)
            .map(item => item.innerText)
            .map(text => `• ${text}`);

        let responseYOffset = yOffset + 10;
        overallResponsesList.forEach(line => {
            doc.text(line, 100, responseYOffset);
            responseYOffset += 5;
        });

        yOffset = responseYOffset + 20; // Adjust yOffset after the responses (add more space after the list)
    }

    // Select all dynamically created cards (for each branch)
    const cardElements = document.querySelectorAll('.custom-card');

    for (let cardElement of cardElements) {
        // Skip the overall chart to avoid duplication
        const chartCanvas = cardElement.querySelector('canvas');
        if (chartCanvas.id.startsWith('overallChart')) {
            continue; // Skip the overall feedback chart
        }

        const chartImage = await html2canvas(chartCanvas, { scale: 4 });
        const chartData = chartImage.toDataURL('image/png');

        // Add the chart image to the PDF
        doc.addImage(chartData, 'PNG', 10, yOffset, 70, 70);

        // Get the response list from the card
        const responseList = cardElement.querySelector('ul');
        if (responseList) {
            const responseLines = Array.from(responseList.children)
                .map(item => item.innerText)
                .map(text => `• ${text}`);

            let responseYOffset = yOffset + 10;
            responseLines.forEach(line => {
                doc.text(line, 100, responseYOffset);
                responseYOffset += 5;
            });
        }

        yOffset += 80; // Move down for the next chart
        if (yOffset > 260) {
            doc.addPage();
            yOffset = 40; // Reset yOffset for new page
        }
    }

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Area: Monaragala`, 10, 30);
        doc.text(`Question: ${questionNumber}`, 10, 35);
        doc.text(`Report Date and Time: ${currentDate}`, 10, 40);
        doc.setFontSize(10);
        doc.text(`Page ${i}`, 185, 285);
    }

    // Save the generated PDF
    doc.save(`${branchName}_Cust_Eval_Report_${new Date().toLocaleDateString()}.pdf`);
}