   /**********************************************************************
     * On This Day – History App
     * --------------------------------------------------------------------
     * Questa app scarica eventi storici, nascite e morti per un determinato giorno
     * utilizzando l'API gratuita di history.muffinlabs.com. L'utente può selezionare 
     * una data (default: oggi) e, opzionalmente, filtrare i risultati tramite una keyword.
     * Ogni evento viene visualizzato in una card con l'anno, la descrizione e, se disponibile,
     * dei link per maggiori dettagli.
     **********************************************************************/
    
    // Elementi DOM
    const dateInput = document.getElementById("dateInput");
    const keywordInput = document.getElementById("keywordInput");
    const fetchDataBtn = document.getElementById("fetchDataBtn");
    const resultsDiv = document.getElementById("results");
    
    // Imposta la data di default al caricamento della pagina (data odierna)
    window.addEventListener("load", () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      dateInput.value = `${yyyy}-${mm}-${dd}`;
      // Auto-fetch dei dati per oggi
      fetchHistoryData();
    });
    
    // Evento click sul bottone "Search"
    fetchDataBtn.addEventListener("click", fetchHistoryData);
    
    /**
     * Funzione per scaricare i dati storici in base alla data selezionata.
     * Usa l'endpoint HTTPS: https://history.muffinlabs.com/date/MM/DD
     */
    function fetchHistoryData() {
      let selectedDate = dateInput.value;
      if (!selectedDate) {
        selectedDate = new Date().toISOString().split("T")[0];
      }
      
      const dateObj = new Date(selectedDate);
      const month = dateObj.getMonth() + 1; // getMonth() restituisce valore 0-11
      const day = dateObj.getDate();
      
      // Costruisci l'URL API usando HTTPS
      const apiUrl = `https://history.muffinlabs.com/date/${month}/${day}`;
      resultsDiv.innerHTML = `<p>Loading historical data for ${month}/${day}...</p>`;
      
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok: " + response.status);
          }
          return response.json();
        })
        .then(data => {
          displayHistoryData(data);
        })
        .catch(error => {
          console.error("Error fetching history data:", error);
          resultsDiv.innerHTML = `<p class="text-danger">Error loading history data. Please try again later.</p>`;
        });
    }
    
    /**
     * Visualizza i dati storici scaricati, suddividendo i dati in Events, Births e Deaths,
     * applicando il filtro keyword se fornito.
     * @param {Object} data - I dati JSON restituiti dall'API.
     */
    function displayHistoryData(data) {
      const events = data.data.Events || [];
      const births = data.data.Births || [];
      const deaths = data.data.Deaths || [];
      
      // Ottieni la keyword (se presente) per il filtraggio
      const keyword = keywordInput.value.trim().toLowerCase();
      
      // Funzione di filtro: se è fornita una keyword, ritorna solo gli elementi che la contengono.
      const filterItems = (items) => {
        if (!keyword) return items;
        return items.filter(item => item.text && item.text.toLowerCase().includes(keyword));
      };
      
      const filteredEvents = filterItems(events);
      const filteredBirths = filterItems(births);
      const filteredDeaths = filterItems(deaths);
      
      // Funzione per generare le card per una determinata categoria.
      function generateCards(categoryName, items) {
        let html = `<h3 class="section-header">${categoryName} (${items.length})</h3>`;
        if (items.length === 0) {
          html += "<p>No records found.</p>";
        } else {
          items.forEach(item => {
            html += `
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">${item.year}</h5>
                  <p class="card-text">${item.text}</p>
            `;
            // Se ci sono link, aggiungi dei pulsanti "Read more"
            if (item.links && item.links.length > 0) {
              item.links.forEach(linkObj => {
                html += `<a href="${linkObj.link}" target="_blank" class="btn btn-sm btn-outline-primary me-1">${linkObj.title}</a>`;
              });
            }
            html += `
                </div>
              </div>
            `;
          });
        }
        return html;
      }
      
      // Costruisci le sezioni per Events, Births e Deaths.
      let finalHtml = "";
      finalHtml += generateCards("Events", filteredEvents);
      finalHtml += generateCards("Births", filteredBirths);
      finalHtml += generateCards("Deaths", filteredDeaths);
      
      resultsDiv.innerHTML = finalHtml;
    }
    
