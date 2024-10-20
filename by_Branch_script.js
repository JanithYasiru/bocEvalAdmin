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

async function populateBranches() {
    const branchSelect = document.getElementById('branch-select');
    const branchesRef = collection(db, 'Br_in_Area');
    const branchesSnap = await getDocs(branchesRef);

    branchesSnap.forEach(docSnap => {
        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = docSnap.id;
        branchSelect.appendChild(option);
    });
}


let branchCode;

document.getElementById('branch-select').addEventListener('change', function () {
    branchCode = this.value;
    if (!branchCode) return;

    fetchStatistics(branchCode);
});


async function fetchStatistics(branchCode) {
    if (!branchCode) {
        console.error('Branch code is not set.');
        alert('Branch code is missing. Please ensure you are accessing this page correctly.');
        return;
    }

    const statisticsContainer = document.getElementById('statistics-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Show the loading spinner
    loadingSpinner.style.display = 'block';
    statisticsContainer.style.display = 'none';
    statisticsContainer.innerHTML = ''; // Clear previous content

    try {
        // Fetch total response count
        const totalRespCountRef = doc(db, `Br_in_Area/${branchCode}/respCount/totalRespCount`);
        const totalRespCountSnap = await getDoc(totalRespCountRef);
        if (totalRespCountSnap.exists()) {
            const totalCount = totalRespCountSnap.data().count;
            const totalRespCountDiv = document.createElement('div');
            totalRespCountDiv.innerHTML = `<h5>Total Responses: ${totalCount}</h5>`;
            statisticsContainer.appendChild(totalRespCountDiv);
        } else {
            console.error('Total response count document does not exist.');
        }

        // Define colors for specific response types
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

        // Fetch responses for each question and create pie charts
        for (let i = 1; i <= 6; i++) {
            const questionRef = collection(db, `Br_in_Area/${branchCode}/Q${i}`);
            const questionSnap = await getDocs(questionRef);
            const responses = {};
            questionSnap.forEach(docSnap => {
                const responseData = docSnap.data();
                for (const [response, count] of Object.entries(responseData)) {
                    if (responses[response]) {
                        responses[response] += count;
                    } else {
                        responses[response] = count;
                    }
                }
            });

            // Create a card for each question
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card mb-3 custom-card col-md-6'; // Add custom-card class and col-md-6
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            cardDiv.appendChild(cardBody);

            // Add card title
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.innerText = `Question ${i} Responses:`;
            cardBody.appendChild(cardTitle);

            // Add canvas for the pie chart
            const canvas = document.createElement('canvas');
            canvas.id = `questionChart${i}`;
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

            statisticsContainer.appendChild(cardDiv);

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
                            text: `Question ${i} Responses`
                        }
                    },
                    hover: {
                        mode: null, // Disable hover mode
                        animationDuration: 0 // Disable hover animation
                    }
                }
            });
        }

        // Hide the loading spinner and show the statistics
        loadingSpinner.style.display = 'none';
        statisticsContainer.style.display = 'flex';
        statisticsContainer.style.flexWrap = 'wrap';

    } catch (error) {
        console.error('Error fetching statistics:', error);
        alert('Failed to fetch statistics. Please try again later.');

        // Hide the loading spinner in case of error
        loadingSpinner.style.display = 'none';
    }
}


populateBranches().catch(error => {
    console.error('Error populating branches:', error);
});

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

    const branchName = document.getElementById('branch-select').options[document.getElementById('branch-select').selectedIndex].text;
    const totalResponsesText = document.querySelector('h5').textContent; // Ensure this element exists
    const currentDate = new Date().toLocaleString(); // Get current date and time

    // Set up PDF document header
    doc.setFont("Helvetica", "bold"); // Set font family and style to bold
    doc.setFontSize(16); // Set the font size to 16 (or any size you prefer)
    doc.text(`Bank Of Ceylon - Customer Experience Evaluations`, 10, 15);

    doc.setFont("Helvetica", "bold"); // Set font family and style to bold
    doc.setFontSize(13); // Set the font size to 16 (or any size you prefer)
    doc.text(`(Summary by Branches)`, 10, 21);

    doc.setFont("Helvetica", "normal"); // Set font family and style to normal
    doc.setFontSize(12); // Set the font size to 12 (or any size you prefer)

    doc.text(totalResponsesText, 10, 50);

    let yOffset = 55; // Initial y-offset for the charts

    // Select all dynamically created cards
    const cardElements = document.querySelectorAll('.custom-card');

    for (let cardElement of cardElements) {
        const chartCanvas = cardElement.querySelector('canvas'); // Get the canvas inside the card
        const chartImage = await html2canvas(chartCanvas, { scale: 4 }); // Capture the chart as an image
        const chartData = chartImage.toDataURL('image/png'); // Convert canvas to image

        // Add the chart image to the PDF
        doc.addImage(chartData, 'PNG', 10, yOffset, 70, 70); // Add the chart image

        // Get the response list from the card
        const responseList = cardElement.querySelector('ul'); // Get the unordered list
        if (responseList) {
            // Create an array to hold the response text with bullets
            const responseLines = Array.from(responseList.children)
                .map(item => item.innerText) // Get text content of each list item
                .map(text => `• ${text}`); // Add bullet point

            // Set the x-coordinate for the response text to be to the right of the chart
            const leftXPosition = 100; // Adjust this value to position the text right next to the chart

            // Set initial y-offset for the responses
            let responseYOffset = yOffset + 10; // Start below the chart

            // Iterate through the response lines and position them
            responseLines.forEach(line => {
                doc.text(line, leftXPosition, responseYOffset); // Align left next to the chart
                responseYOffset += 5; // Move down for the next bullet
            });
        }

        yOffset += 60; // Move down for the next chart
        yOffset += 20; // Space after the details
        if (yOffset > 260) { // Start a new page if needed
            doc.addPage();
            yOffset = 45; // Reset yOffset for new page
        }
    }

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages(); // Get the total number of pages
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Go to each page

        doc.setFont("Helvetica", "normal"); // Set font family and style to normal
        doc.setFontSize(12); // Set the font size to 12 (or any size you prefer)

        doc.text(`Area: Monaragala`, 10, 30);
        doc.text(`Branch: ${branchName}`, 10, 35);
        doc.text(`Branch Code: ${branchCode}`, 10, 40);
        doc.text(`Report Date and Time: ${currentDate}`, 10, 45);

        doc.setFontSize(10); // Set the font size for page number
        doc.text(`Page ${i}`, 185, 285); // Adjust the position if necessary
    }

    // Save the generated PDF
    doc.save(`${branchCode}-${branchName}_Cust_Eval_Report_${new Date().toLocaleDateString()}.pdf`);
}