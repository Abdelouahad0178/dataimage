// Variables globales pour recherche, mois et années
let currentSearchTerm = '';
let currentMonthFilter = '';
let currentYearFilter = '';

// Chargement des factures depuis le fichier JSON
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        displayFactures(data);

        // Événements pour recherche, mois et année
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
    });

// Fonction pour afficher les factures
function displayFactures(factures) {
    const container = document.getElementById('factures-container');
    container.innerHTML = '';

    factures.forEach(facture => {
        const factureElement = document.createElement('div');
        factureElement.className = 'facture';

        factureElement.innerHTML = `
            <img src="${facture.image}" alt="Facture ${facture.name}">
            <p>${facture.name} - ${facture.date}</p>
        `;
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
