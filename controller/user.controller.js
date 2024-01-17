const { myColl } = require("../src/dbOperations");
const jwt = require('jsonwebtoken');

var msg = "Utilisateur Introuvable"
errorMsg = ""

async function VerifUserInfos(data) {
  var result = false
  const identicalUser = await myColl.findOne({ fullname: data["fullname"], email: data["email"], phone: data["phone"] });

  if (identicalUser !== null) {
    // User found
    result = true
    msg = 'identicalUser found !!!'
    console.log(msg)
    console.log(identicalUser)

  } else {
    // User not found 
    const namedUser = await myColl.findOne({ fullname: data["fullname"] });

    if (namedUser !== null) {
      // namedUser found
      result = true
      msg = 'namedUser found !!!'

      console.log(msg)
      console.log(namedUser)

    } else {
      // namedUser not found
      const emailedUser = await myColl.findOne({ email: data["email"] });

      if (emailedUser !== null) {
        // emailedUser found
        result = true
        msg = 'emailedUser found !!'
        console.log(msg)
        console.log(emailedUser)

      } else {
        // emailedUser not found
        const phonedUser = await myColl.findOne({ phone: data["phone"] });

        if (phonedUser !== null) {
          // phonedUser found
          result = true
          msg = 'phonedUser found !'
          console.log(msg)
          console.log(phonedUser)

        } else {
          // phonedUser not found 
          // it a new user in the system so please take him

        }
      }

    }

  }


  return result
}

function SendMsg() {
  errorMsg = msg
  return errorMsg
}



// La clé secrète utilisée pour signer le token. Gardez cela sécurisé!
const secretKey = 'TPDrivInCot';

// Fonction pour créer un token JWT
async function createToken(userId) {

  // Informations à inclure dans le token
  const payload = {
    id: userId,
    ticketIds: [],
  };

  // Options du token (expiration, algorithme de signature, etc.)
  const options = {
    algorithm: 'HS256',
    issuer: 'authServer',
    subject: 'tpDriving',
    jwtid: 'uniqueTokenId',
  };

  // Création du token
  const token = jwt.sign(payload, secretKey, options);

  return token;
}

function getCurrentDate() {
  const today = new Date();
  const currentDay = today.getDate().toString().padStart(2, '0');
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = today.getFullYear();

  return `${currentDay}/${currentMonth}/${currentYear}`;
}

function checkTripDate(today, dateString) {

  // Etablissement du format de date
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  // Vérification de la conformité du format de date du User
  if (!dateRegex.test(dateString)) {
    console.log(dateString);
    return false;
  } else {

    const d1 = new Date(today);
    const d2 = new Date(dateString);
    console.log(today + "-" + dateString)
    // Récupération dans des variables distinctes des petits éléments
    // constitutifs des dates du jour et du User à savoir jj mm et aaaa
    const [day, month, year] = dateString.split('/').map(String);
    const [currentDay, currentMonth, currentYear] = today.split('/').map(String);

    if (year < currentYear) {
      return false;
    }
    if (year > currentYear) {
      return true;
    }
    if (year === currentYear) {
      if (month < currentMonth) {
        return false;
      } else if (month > currentMonth) {
        return true;
      }
    }
    if (year === currentYear && month === currentMonth) {
      if (day < currentDay) {
        return false;
      } else if (day > currentDay) {
        return true;
      }
    }
    if (year === currentYear && month === currentMonth && currentDay === day) {
      return false;
    }


  }

}


module.exports = { VerifUserInfos, SendMsg, createToken, getCurrentDate, checkTripDate, getCurrentDate }