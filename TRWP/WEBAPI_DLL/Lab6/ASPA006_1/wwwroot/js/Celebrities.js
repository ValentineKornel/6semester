
const loadCelebrities = async () => {
    try {
        let response = await fetch('http://localhost:5000/api/Celebrities');
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        let data = await response.json();

        let html = '';
        data.forEach(celeb => {
            html += `<img src=Photos/${celeb.reqPhotoPath} alt="${celeb.fullName}" onclick="getLifeevents('${celeb.fullName}', ${celeb.id})"/>`;
        });
        document.getElementById('celebrities-container').innerHTML = html;
    } catch (error) {
        console.error("Ошибка запроса:", error);
        document.getElementById('celebrities-container').innerText = "Ошибка запроса: " + error.message;
    }
}

const getLifeevents = async (celebrityName, celebrityId) => {
    try {
        let response = await fetch(`http://localhost:5000/api/Lifeevents/Celebrities/${celebrityId}`);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        let data = await response.json();

        let html = '';
        data.forEach(event => {
            html += `<p>${celebrityName}          ${event.date} ${event.description}</p>`;
        });
        document.getElementById('live-events-container').innerHTML = html;
    } catch (error) {
        console.error("Ошибка запроса:", error);
        document.getElementById('celebrities-container').innerText = "Ошибка запроса: " + error.message;
    }
}

loadCelebrities();