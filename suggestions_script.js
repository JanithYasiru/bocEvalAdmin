const AdminCreds = JSON.parse(sessionStorage.getItem("admin-creds"));

if (AdminCreds) {
    msg.innerText = `Admin with email ${AdminCreds.email} Successfully Logged In!`;
} else {
    window.location.href = 'login.html'; // Redirect to login page if no credentials found
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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

    fetchSuggestions(branchCode);
});

let totalCount = 0;

async function fetchSuggestions(branchCode) {
    const suggestionsContainer = document.getElementById('suggestions-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Show the loading spinner
    loadingSpinner.style.display = 'block';
    suggestionsContainer.style.display = 'none';
    suggestionsContainer.innerHTML = ''; // Clear previous content

    try {
        const suggestionsRef = collection(db, `Br_in_Area/${branchCode}/suggestions`);
        const suggestionsSnap = await getDocs(suggestionsRef);

        if (!suggestionsSnap.empty) {


            suggestionsSnap.forEach(docSnap => {
                const suggestionData = docSnap.data();
                totalCount += suggestionData.count || 0;

                for (const [key, value] of Object.entries(suggestionData)) {
                    if (key !== 'count') {
                        const suggestionCard = document.createElement('div');
                        suggestionCard.className = 'card mb-3 custom-card-sugg';
                        const cardBody = document.createElement('div');
                        cardBody.className = 'card-body';
                        suggestionCard.appendChild(cardBody);

                        const suggestionTitle = document.createElement('h5');
                        suggestionTitle.className = 'card-title';
                        suggestionTitle.innerText = key;
                        cardBody.appendChild(suggestionTitle);

                        const suggestionText = document.createElement('p');
                        suggestionText.className = 'card-text';
                        suggestionText.innerText = value;
                        cardBody.appendChild(suggestionText);

                        suggestionsContainer.appendChild(suggestionCard);
                    }
                }
            });

            const totalSuggestionsCard = document.createElement('div');
            totalSuggestionsCard.className = 'card mb-3 custom-card-sugg';
            const totalCardBody = document.createElement('div');
            totalCardBody.className = 'card-body';
            totalSuggestionsCard.appendChild(totalCardBody);

            const totalSuggestionsTitle = document.createElement('h5');
            totalSuggestionsTitle.className = 'card-title';
            totalSuggestionsTitle.innerText = `Total Suggestions: ${totalCount}`;
            totalCardBody.appendChild(totalSuggestionsTitle);

            suggestionsContainer.insertBefore(totalSuggestionsCard, suggestionsContainer.firstChild);

            suggestionsContainer.style.display = 'block';
        } else {
            console.error('No suggestions found for this branch.');
        }

        // Hide the loading spinner
        loadingSpinner.style.display = 'none';

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        alert('Failed to fetch suggestions. Please try again later.');

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



document.getElementById('generate-pdf').addEventListener('click', function () {
    const branchSelect = document.getElementById('branch-select');
    const branchName = branchSelect.options[branchSelect.selectedIndex].text;
    const suggestionsContainer = document.getElementById('suggestions-container');

    if (suggestionsContainer.style.display === 'none' || suggestionsContainer.innerHTML.trim() === '') {
        alert('No suggestions available to generate a report.');
        return;
    }

    // Create new jsPDF instance
    const { jsPDF } = window.jspdf; // Import jsPDF from window object
    const doc = new jsPDF();

    // Set up the current date
    const currentDate = new Date().toLocaleString();

    // Create the header with different font styles
    doc.setFont("Helvetica", "bold"); // Set font to bold
    doc.setFontSize(16); // Set font size to 16
    doc.text("Bank Of Ceylon - Customer Experience Evaluations", 10, 15); // Add the main title

    doc.setFont("Helvetica", "bold"); // Keep the font bold for the subtitle
    doc.setFontSize(13); // Set font size to 13
    doc.text("(Summary by Branches)", 10, 21); // Add the subtitle

    // Reset font to normal for the rest of the content
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    // Add total suggestions info
    const totalSuggestions = totalCount; // Get the number of suggestions
    const totalSuggestionsText = `Total Suggestions: ${totalSuggestions}`;
    doc.text(totalSuggestionsText, 10, 50); // Add total suggestions to PDF

    // Add date and time of the report generation
    doc.text(`Report Date and Time: ${currentDate}`, 10, 45);

    // Add the suggestions here
    let yPosition = 60; // Start a bit further down for suggestions
    const suggestions = document.querySelectorAll('.custom-card-sugg'); // Assuming suggestions are within '.custom-card' class

    suggestions.forEach((suggestion, index) => {
        const suggestionTitleElement = suggestion.querySelector('.card-title');
        const suggestionTextElement = suggestion.querySelector('.card-text');

        if (suggestionTitleElement && suggestionTextElement) {
            const suggestionTitle = suggestionTitleElement.innerText;
            const suggestionText = suggestionTextElement.innerText;

            // Add suggestion title
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Suggestion : ${index}`, 10, yPosition); // Suggestion Title

            yPosition += 5; // Move down a bit

            // Add suggestion text
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(11);
            doc.text(suggestionText, 10, yPosition); // Suggestion Text

            yPosition += 10; // Adjust the y position for the next suggestion

            // Check if yPosition exceeds the page limit (e.g., 280 for an A4 page with margins)
            if (yPosition > 280) {
                doc.addPage(); // Add new page
                yPosition = 55; // Reset yPosition for the new page
            }
        } else {
            console.warn(`Suggestion #${index + 1} does not have the required elements.`);
        }
    });

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

    // Save the PDF
    doc.save(`${branchName}_Suggestions_Report.pdf`);
});