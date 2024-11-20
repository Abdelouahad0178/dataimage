// Variables globales pour recherche et filtres
let currentSearchTerm = '';
let currentMonthFilter = '';
let currentYearFilter = '';
let factures = []; // Stockage local des factures après le chargement

// Fonction pour charger les factures depuis la base de données
async function loadFactures() {
    try {
        const response = await fetch('/factures');
        if (!response.ok) {
            throw new Error('Erreur réseau lors du chargement des données.');
        }
        factures = await response.json();
        filterFactures();
    } catch (error) {
        console.error('Erreur lors du chargement des factures :', error);
    }
}

// Fonction pour afficher les factures dans le conteneur
function displayFactures(data) {
    const container = document.getElementById('factures-container');
    if (!container) {
        console.error('Élément #factures-container introuvable.');
        return;
    }

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p>Aucune facture trouvée.</p>';
        return;
    }

    data.forEach(facture => {
        const factureElement = document.createElement('div');
        factureElement.className = 'facture';

        factureElement.innerHTML = `
            <img src="uploads/${facture.image}" alt="Facture ${facture.name}">
            <p>${facture.name} - ${facture.date}</p>
            <button class="delete" onclick="deleteFacture('${facture._id}')">Supprimer</button>
        `;

        container.appendChild(factureElement);
    });
}

// Fonction pour filtrer les factures
function filterFactures() {
    const filtered = factures.filter(facture => {
        const matchesSearch = facture.name.toLowerCase().includes(currentSearchTerm);
        const matchesMonth = currentMonthFilter === '' || facture.date.split('-')[1] === currentMonthFilter;
        const matchesYear = currentYearFilter === '' || facture.date.split('-')[0] === currentYearFilter;
        return matchesSearch && matchesMonth && matchesYear;
    });

    displayFactures(filtered);
}

// Fonction pour supprimer une facture
async function deleteFacture(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
        try {
            const response = await fetch(`/factures/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Facture supprimée avec succès.');
                loadFactures(); // Recharger les factures après suppression
            } else {
                alert('Erreur lors de la suppression de la facture.');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression :', error);
        }
    }
}

// Fonction pour ajouter une nouvelle facture
async function addFacture(formData) {
    try {
        const response = await fetch('/add-facture', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Facture ajoutée avec succès : ${result.facture.name}`);
            loadFactures(); // Recharger les factures
            const form = document.getElementById('add-facture-form');
            if (form) form.reset(); // Réinitialiser le formulaire
        } else if (response.status >= 400 && response.status < 500) {
            const errorData = await response.json();
            alert(`Erreur : ${errorData.error || 'Requête invalide.'}`);
        } else {
            alert('Erreur : Une erreur s\'est produite sur le serveur.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la facture :', error);
        alert('Erreur : Impossible de communiquer avec le serveur.');
    }
}

// Gestion du modal
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalDetails = document.getElementById('modal-details');

// Fonction pour afficher le modal
function showModal(data) {
    if (modalImage && modalDetails && modal) {
        modalImage.src = `uploads/${data.image}`;
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
                <img src="${modalImage.src}" alt="Facture à imprimer">
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    } else {
        console.error('Aucune image à imprimer.');
    }
}

// Initialisation des événements une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire d'ajout de facture
    const form = document.getElementById('add-facture-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addFacture(formData);
        });
    } else {
        console.warn('Formulaire #add-facture-form introuvable.');
    }

    // Boutons de fermeture du modal
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Événement pour fermer le modal en cliquant en dehors de son contenu
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Recherche et filtres
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            filterFactures();
        });
    } else {
        console.warn('Champ de recherche #search introuvable.');
    }

    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) {
        monthFilter.addEventListener('change', (e) => {
            currentMonthFilter = e.target.value;
            filterFactures();
        });
    }

    const yearFilter = document.getElementById('year-filter');
    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            currentYearFilter = e.target.value;
            filterFactures();
        });
    }

    // Charger les factures
    loadFactures();
});
