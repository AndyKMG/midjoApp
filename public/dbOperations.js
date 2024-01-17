
const { TokenExpiredError } = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dburl = "mongodb+srv://admin:admin@cluster0.0b330r1.mongodb.net/DrivingGest?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(dburl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const myDB = client.db("DrivingGest");

const myColl = myDB.collection("usersinfos");
const mytripColl = myDB.collection("tripinfos");
const myTokenColl = myDB.collection("tokens");
const myPaiementColl = myDB.collection("paiements")
// var result = false;


async function CreateUser(userInfos) {
  const result = await myColl.insertOne(userInfos);
  console.log(
    `A document was inserted with the _id: ${result.insertedId}`,
  );
  return `${result.insertedId}`;
}


async function getUser(userId) {
  const result = await myColl.findOne({_id : userId});
  return `${result}`
}


async function insertToken(token) {
  const result = await myTokenColl.insertOne(token);
  console.log(
    `A document was inserted with thw _id: ${result.insertedId}`
  );
  return `${result.insertedId}`;
}


async function checkToken(tokenId) {
  let token;
  try {
    token = await myTokenColl.findOne({ id: tokenId })

    if (token != null) {
      console.log(token)
      console.log(
        `The Token has been found !`
      )
    } else {
      console.log(token)
      console.log(
        `The Token has not been found !`
      )
      throw err;
    }

  } catch (err) {
    console.error('Une erreur s\'est produite :', err);

  } finally {
    return token;
  }

}


async function CheckUser(data) {

  try {
    // Récupérer tous les identifiants (_id) de la collection
    // const ids = await myColl.find({});

    // Parcourir chaque identifiant et vérifier la conformité des champs
    // for await (const id of ids) {
    //Récupérer le document par _id
    const user = await myColl.findOne({ phone: data["phone"], password: data["password"] });
    console.log(user)
    await ResultSender(user)

    return user
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
  }
}

function RecupId(user) {
  console.log(user)
  // Supposons que vous ayez une chaîne de caractères représentant votre ObjectId
  const idString = user._id.toString();
  console.log(idString)

  // Utilisez une expression régulière pour extraire la partie spécifique de l'ObjectId
  // const userid = idString.match(/ObjectId\('(.*)'\)/)[1];

  console.log(idString)
  const tokenid = `id` + idString
  return tokenid
}


function ResultSender(res) {
  if (res !== null)
    result = true
  return res
}


async function ReserveTicket(ticketsInfos) {
  const result = await mytripColl.insertOne(ticketsInfos)
  const insertedId =  result.insertedId

  console.log(`A document was inserted with the _id: ${insertedId}`)
  return insertedId
}

async function findTicket(ticketId){
  console.log(ticketId)
    // Récupérer l'enregistrement complet à partir de l'ID inséré
    const insertedRecord = await mytripColl.findOne({ _id: ticketId })
    return insertedRecord

}


async function findToken(tokenId) {
  const token = await myTokenColl.findOne({ id: tokenId })
  console.log(token)
  return token

}

async function updateToken(tokenId, newTicketId) {
  try {
    // Vérifier si le champ "ticketIds" existe et est un tableau
    var existingToken = await myTokenColl.findOne({ id: tokenId });

    if (!existingToken) {
      // Si le document n'existe pas, l'initialiser avec le tableau
      await myTokenColl.insertOne({ id: tokenId, ticketIds: [newTicketId] });
    } else if (!Array.isArray(existingToken.ticketIds)) {
      // Si le champ n'est pas un tableau, le convertir en tableau
      await myTokenColl.updateOne(
        { id: tokenId },
        { $set: { "ticketIds": [existingToken.ticketIds, newTicketId] } }
      );
    } else {
      // Mise à jour du document avec le nouvel élément
      const result = await myTokenColl.updateOne(
        { id: tokenId },
        { $addToSet: { "ticketIds": newTicketId } }
      );

      // Si le nombre d'enregistrement mis a jour est > a 0
      if (result.modifiedCount > 0) {
        console.log(`Document mis à jour : ${result.modifiedCount} document(s) modifié(s)`);
         existingToken = await myTokenColl.findOne({ id: tokenId });
        return existingToken;
      } 
      // Sinon...
      else {
        console.log(`Aucun document n'a été modifié`);
        return null;
      }
    }
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du document : ${err.message}`);
    throw err;
  }
}

// Fonction d'insertion de l'objet paiement dans la base Mongo
async function insertPaiement(data){
  const result = await myPaiementColl.insertOne(data);
  console.log(
    `A document was inserted with the _id: ${result.insertedId}`,
  );
  return `${result.insertedId}`;
}

// Recuperation de l'objet Paiement dans la base Mongo
async function findPaiement(paiementId){
    // Récupérer l'enregistrement complet à partir de l'ID inséré
    const insertedRecord = await myPaiementColl.findOne({ _id: paiementId })
    console.log(insertedRecord)
    return insertedRecord

}

module.exports = { CreateUser, CheckUser, myDB, myColl, ReserveTicket, insertToken, findToken, checkToken, RecupId, getUser, updateToken, findTicket, insertPaiement, findPaiement }