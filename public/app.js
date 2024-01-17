const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoClient = require('mongodb').MongoClient;
//const mysql = require('mysql');
const connection = require('express-myconnection');
const port = 3030
const geolib = require('geolib')
const app = express();
const router = express.Router();
const qrcode = require('qrcode');

const connectDB = require("./db.js")
const { CreateUser, CheckUser, insertToken, checkToken, RecupId, getUser, findToken, ReserveTicket, updateToken, findTicket, insertPaiement, findPaiement } = require('./dbOperations.js');
const { VerifUserInfos, SendMsg, createToken, checkTripDate, getCurrentDate } = require("../controller/user.controller.js")
const { getCoordinates, generateQRCode } = require("./googleMapsApi.js")
var userId;

// prompt $g
// Middleware de parsing JSON
app.use(express.json());
app.use(bodyParser.json());

// API de SignUp
app.use("/createUser", async (req, res) => {

    // Recuperation du corps de la requete
    // Et affichage pour test
    const data = req.body
    console.log(data)


    try {
        // Verification de l'absence effective du nouvel utilisateur
        const newUserData = await VerifUserInfos(data)
        // Recuperation du message d'erreur 
        const resError = await SendMsg()

        // Si le User Exist 
        // Envoie de la reponse de non creation
        if (newUserData) {
            res.status(200).json({ message: "Utilisateur Existant", errorMsg: resError });
            console.log(resError)
            console.log('Utilisateur Existant')

        } else {

            // Sinon Creation du nuvel Utilisateur
            userId = await CreateUser(data)
            // userdata = await getUser(userId)

            // Creation d'un token pour le nouvel utilisateur
            token = await createToken(`id` + userId)

            // Decodage du token 
            const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));

            // Insertion du Token Decodé dans la Base Mongo
            tokenId = await insertToken(decodedToken)
            // Affichage de l'Id pour test
            console.log(tokenId)

            // Envoie de la reponse au front
            res.status(200).json({ message: "Nouvelle Utilisateur", errorMsg: resError, decodedToken });
            console.log(resError)
            console.log('Nouvelle Utilisateur ')

        }

    } catch (error) {
        // Gestion des erreurs
        console.error("Une erreur s'est produite :", error);
        res.status(500).send({ "message": 'Erreur serveur' });
    }
})

// API de Login
app.use("/checkUser", async (req, res) => {
    // Recuperation du corp de la requete
    const data = req.body
    // Affichage pour test
    console.log(data)

    try {
        // Verification de l'existance de l'utilisateur
        const userData = await CheckUser(data)

        // Recuperation de l'Id de l'utilisateur
        const userId = RecupId(userData)

        // Verification de l'existence du token de l'utilisateur
        const tokenData = await checkToken(userId)
        // console.log(exist)

        // Verification de l'existence du token
        // En cas d'inexistence le creer automatiquement 
        // Mais ca marche pas pour le moment ☺!
        if (userId != null && tokenData == null) {
            tokenData = await createToken(userId)
        }

        // Envoie de la reponse 
        if (userData != null && tokenData != null) {
            res.status(200).send({ "message": 'Utilisateur trouvé', userData, tokenData });
            console.log('Utilisateur trouvé');
        } else {
            res.status(200).send({ "message": 'Utilisateur introuvable' });
            console.log('Utilisateur introuvable');
        }
    } catch (error) {
        // Gestion des erreurs
        console.error("Une erreur s'est produite :", error);
        res.status(500).send({ "message": 'Erreur serveur' });
    }
})

// API de creation de Trip 
app.use("/createTrip", async (req, res) => {
    // Recuperation et Affichage des donnees recu du front
    const data = req.body
    console.log(data)


    try {
        // Recuperation des villes entrees par l'utilisateur
        // depart et Arrivée
        const startPoint = data['startPoint']
        const endPoint = data['endPoint']


        // Recuperation du nombre de place reservées par le User
        const nbPlace = data['nbPlace']

        // Verification de la conformitée de la date entree par le User
        const dateReserve = data['dateReserve']
        const today = getCurrentDate()
        console.log(today + "-" + dateReserve)
        const validDate = checkTripDate(today, dateReserve)

        console.log(" validDate" + "" + validDate)

        // Verification de la conformitée de la date et du nombre de place
        if (validDate && !isNaN(nbPlace)) {

            // Affichage pour test
            console.log(startPoint + endPoint);

            // Conversion en donnees geographiques reelles
            const startCoordinates = await getCoordinates(startPoint);
            const endCoordinates = await getCoordinates(endPoint);

            // Recuperation de la longitude et de la latitude du Point de départ
            const startCoordinatesLatitude = startCoordinates["latitude"];
            const startCoordinatesLongitude = startCoordinates["longitude"];

            // Recuperation de la longitude et de la latitude du Point d'arrivée      
            const endCoordinatesLatitude = endCoordinates["latitude"];
            const endCoordinatesLongitude = endCoordinates["longitude"];

            // Affichage test des coordonnees
            console.log(startCoordinatesLatitude + " - " + startCoordinatesLongitude)
            console.log(endCoordinatesLatitude + " - " + endCoordinatesLongitude)

            // Objets Json des positions de depart et de fin
            const start = { latitude: startCoordinatesLatitude, longitude: startCoordinatesLongitude }
            const end = { latitude: endCoordinatesLatitude, longitude: endCoordinatesLongitude }

            // Evaluation de la distance entre les points 
            const distance = geolib.getDistance(start, end, { unit: 'km' })

            // Affichage test de la distance entre les deux points geographiques
            console.log(distance)

            // Je n'ai pas de reels moyens pour determiner un prix pour la course
            // alors je vais l'exprimer avec la distance geographique pour le moment ! ☻
            // Recuperation du prix du trajet
            var prix = distance

            // Modification du prix du trajet en utilisant la distance geographique
            data['prix'] = prix
            console.log(data['prix'])

            // Si les Positions de depart et de fin sont non null
            if (!start != null && end != null) {

                // Insert a trip occurrence in the dataBase and take back the TicketId
                const newTicketId = await ReserveTicket(data)


                // Recuperation de toute la  ligne du trip inserer 
                const newTicketRecord = await findTicket(newTicketId)


                // Display it for testing 
                // console.log(newTicketId)
                // console.log(newTicketRecord)

                // Recuperation de l'id du token
                const tokenId = data["tokenId"]
                // console.log(tokenId)


                // Mise a jour du token du User avec le nouveau Trip effectuer 
                const updatedToken = await updateToken(tokenId, newTicketId)


                // Envoie de la reponse au front 
                if (updatedToken != null) {
                    res.status(200).send({ "message": 'Ticket réservé', newTicketRecord });
                    console.log('Ticket réservé');
                } else {
                    res.status(200).send({ "message": 'Erreur : Ticket non réservé' });
                    console.log('Erreur : Ticket non réservé');
                }

            }

        } else {
            res.status(200).send({ "message": 'Erreur : Date non valide' });
            console.log('Erreur : Date non valide');
        }

    } catch (err) {
        console.error("Error :", err);
        // Gérer l'erreur comme approprié
        res.status(500).send({ "message": 'Erreur lors de la récupération des coordonnées' });
        return;
    }

})






// API de Validation de Paiement 
app.use("/validPaiement", async (req, res) => {
    // Recuperation du corp de la requete
    const data = req.body
    // Affichage pour test
    console.log(data)

    try {
        // Insertion de l'objet de paiement dans la base 
        const paiementId = await insertPaiement(data);

        // Affichage test
        console.log(paiementId)

        // Envoie de la reponse au front 
        if (paiementId != null) {
            res.status(200).send({ "message": 'Paiement validé', paiementId });
            console.log('Paiement validé');
        } else {
            res.status(200).send({ "message": 'Erreur : Paiement non validé' });
            console.log('Erreur : Ticket non réservé');
        }



    } catch (error) {
        // Gestion des erreurs
        console.error("Une erreur s'est produite :", error);
        res.status(500).send({ "message": 'Erreur serveur' });
    }
})


// API de creation de QrCode 
// J'aurais vraiment prefere 
// la garder dans la precedente 
// mais le corps compplexe de mes reponse commence a 
// poser pb donc...

app.post('/generateQrCode', async (req, res) => {
    try {
      // Access the data sent with the request
      const requestData = req.body;
  
      // Use the requestData to generate the QR code
      const qrCode = await generateQRCode(requestData.id);
  
      // Send the QR code as a response
      res.type('image/png').send(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  
// app.listen(port , ()=>{
//     console.log('Server is listen pn port :' + port)
// })

connectDB()
    .then(() => {
        console.log("db Connexion succeeded")
        app.listen(port,
            () => {
                console.log('Server is listen to port ', port);
            });

    })
    .catch(err => console.log(err))


module.exports = { userId }