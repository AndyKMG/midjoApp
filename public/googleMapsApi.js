const axios = require('axios')
const qrcode = require('qrcode');


// key= gD5bpPP7WddGRFiR7g7eGUOOgBDy6jLZT0Mf26Hl

// Fonction pour obtenir les coordonnées à partir du nom d'un lieu
function getCoordinates(name) {
  return new Promise(async (resolve, reject) => {
    try {
      // https://api.api-ninjas.com/v1/city?name=Perma&country=bj
      //T2LGPIwWXxqWHfrsAIMTSOIiFOayxMH89VNWdlJGL9dwYkcPcozr3sseFTkjP8jGkwE
      /**eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfZW1haWwiOiJrb3VtYWdub25hbmR5NDkwQGdtYWlsLmNvbSIsImFwaV90b2tlbiI6IlQyTEdQSXdXWHhxV0hmcnNBSU1UU09JaUZPYXl4TUg4OVZOV2RsSkdMOWR3WWtjUGNvenIzc3NlRlRralA4akdrd0UifSwiZXhwIjoxNzAzODU5MzM3fQ.pkI6bntVH9-Uu7JtNmdKU0QUqu_4ifYjw_zxp0OZopY*/
      const response = await axios.get(`https://api.api-ninjas.com/v1/city?name=${name}&country=bj`, {
        headers: {
          'X-Api-Key': '9nVGhR4r3xWfqSFJgDF13g==RPXNyAMgPxGy8b7c'
        },
      });

      const jsonData = response.data;
      console.log(jsonData);

      // Assurez-vous que vous avez des données avant d'accéder aux propriétés
      if (jsonData.length > 0) {
        const CoordinatesLongitude = jsonData[0].longitude;
        const CoordinatesLatitude = jsonData[0].latitude;

        // Mise en forme des Coordonnees
        const coordinateJson = { "latitude": CoordinatesLatitude, "longitude": CoordinatesLongitude };

        // Renvoie des Coordonnees
        resolve(coordinateJson);
      } else {
        reject("Aucune donnée disponible pour ce lieu.");
      }
    } catch (error) {
      reject(`Erreur lors de la requête : ${error.message}`);
    }
  });
}


// Function to generate QR code using the 'qrcode' package
async function generateQRCode(data) {
  try {
    // Use the data to generate the QR code
    const qrCode = await qrcode.toBuffer(data);

    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}
module.exports = { getCoordinates, generateQRCode }