const mail = {
  recipientEmail: "toto@toto.com",
  recipientName: "toto",
  senderEmail: "titi@titi.com",
  senderName: "Titi",
  subject: "Promise is wonderful",
  content: "Promise is very wonderful",
};

const campaign = {
  name: "Promise promotion",
  mail: mail,
};

const campaignBatch = {
  name: "Promise promotion",
  mails: [mail, mail, mail, mail],
};

function createCampaignMail(mailData) {
  try {
    validateMailData(mailData);
    dbConnect()
      .then(() => insertCampaign(campaign))
      .then(fetchCampaign)
      .then((campaignData) => sendMail(campaign.mail))
      .then(() => send(201))
      .catch((error) => {
        console.error(error.message);
        send(500);
      });
  } catch (error) {
    console.error(error.message);
  }
}

function createBatchCampaignMail(mailData) {
  try {
    validateMailData(mailData);
    dbConnect()
      .then(() => insertCampaign(campaign))
      .then(fetchCampaign)
      .then((campaignData) => Promise.all(campaignBatch.mails.map(sendMail)))
      .then(() => send(201))
      .catch((error) => {
        console.error(error.message);
        send(500);
      });
  } catch (error) {
    console.error(error.message);
  }
}
