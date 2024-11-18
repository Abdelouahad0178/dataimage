// Variables globales pour recherche et filtres
let currentSearchTerm = '';
let currentMonthFilter = '';
let currentYearFilter = '';

// Chargement des factures depuis le fichier JSON
fetch('data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau lors du chargement des données.');
        }
        return response.json();
    })
    .then(data => {
        displayFactures(data);

        // Ajout des événements pour recherche, mois et année
        document.getElementById('search').addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            filterFactures(data);
        });

        document.getElementById('month-filter').addEventListener('change', (e) => {
            currentMonthFilter = e.target.value;
            filterFactures(data);
        });

        document.getElementById('year-filter').addEventListener('change', (e) => {
            currentYearFilter = e.target.value;
            filterFactures(data);
        });
    })
    .catch(error => console.error('Erreur lors du chargement des factures :', error));

// Fonction pour afficher les factures
function displayFactures(factures) {
    const container = document.getElementById('factures-container');
    container.innerHTML = '';

    factures.forEach(facture => {
        const factureElement = document.createElement('div');
        factureElement.className = 'facture';

        factureElement.innerHTML = `
            <img src="${facture.image}" alt="Facture ${facture.name}" 
                 data-name="${facture.name}" data-date="${facture.date}" data-image="${facture.image}">
            <p>${facture.name} - ${facture.date}</p>
        `;

        // Ajouter un événement de clic sur l'image pour afficher le modal
        factureElement.querySelector('img').addEventListener('click', (e) => {
            showModal(e.target.dataset);
        });

        container.appendChild(factureElement);
    });
}

// Fonction pour filtrer les factures
function filterFactures(factures) {
    const filtered = factures.filter(facture => {
        const matchesSearch = facture.name.toLowerCase().includes(currentSearchTerm);
        const matchesMonth = currentMonthFilter === '' || facture.date.split('-')[1] === currentMonthFilter;
        const matchesYear = currentYearFilter === '' || facture.date.split('-')[0] === currentYearFilter;
        return matchesSearch && matchesMonth && matchesYear;
    });

    displayFactures(filtered);
}

// Gestion du modal
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalDetails = document.getElementById('modal-details');

// Fonction pour afficher le modal
function showModal(data) {
    if (modalImage && modalDetails && modal) {
        modalImage.src = data.image;
        modalDetails.textContent = `Nom : ${data.name} | Date : ${data.date}`;
        modal.classList.add('show');
    } else {
        console.error('Impossible d\'afficher le modal, les éléments nécessaires ne sont pas chargés.');
    }
}

// Fonction pour fermer le modal
function closeModal() {
    if (modal) {
        modal.classList.remove('show');
    }
}

// Fonction pour imprimer l'image affichée dans le modal
function imprimerImage() {
    if (modalImage && modalImage.src) {
        const printWindow = window.open('', '', 'width=800,height=800');
        printWindow.document.write(`
            <html>
            <head>
                <title>Imprimer l'Image</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f4f4f4;
                    }
                    img {
                        width: 90%;
                        height: auto;
                        border: 2px solid #333;
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <img src="${modalImage.src}" alt="Facture à imprimer" />
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    } else {
        console.error('Aucune image à imprimer.');
    }
}

// Initialisation des événements
document.addEventListener('DOMContentLoaded', () => {
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    } else {
        console.error('Le bouton pour fermer le modal est introuvable.');
    }

    // Événement pour fermer le modal en cliquant en dehors de son contenu
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
