const path = require('path');

// this is where you decided to download your service account credentials
const SERVICE_ACCOUNT_CREDENTIALS = path.resolve('./translate-api-credentials.json');

// You must set this environment variable before you require the
// @google-cloud npm modules to authorize properly
process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_CREDENTIALS;
const { TranslationServiceClient } = require('@google-cloud/translate');
const translationClient = new TranslationServiceClient();
const { Storage } = require('@google-cloud/storage');

// insert your own PROJECT ID and BUCKET_NAME here
// const PROJECT_ID = 'PROJECT_ID';
const PROJECT_ID = 'dynamic-nomad-378422';
const BUCKET_NAME = 'test-translate-glossary';

// insert your own GLOSSARY_URI here
// const GLOSSARY_URI = 'GLOSSARY_URI';
const GLOSSARY_URI = `gs://${BUCKET_NAME}/glossary.csv`;

// GLOSSARY_LANGS are the languages your glossary supports. These are the
// languages in the column headers of your glossary
const GLOSSARY_LANGS = ['en', 'es'];

// you can decide your own GLOSSARY_ID. this is used if you need to update/delete
// the glossary resource
const GLOSSARY_ID = 'my-glossary';
const LOCATION = 'us-central1';

const storage = new Storage({
  projectId: PROJECT_ID,
});

async function uploadNewGlossaryFileToBucket() {
  console.log('Uploading glossary.csv to bucket...');
  await storage.bucket(BUCKET_NAME).upload(path.resolve('./glossary.csv'));
  console.log(`Uploaded successfully to ${BUCKET_NAME}!`);
}

async function createGlossaryResource() {
  const request = {
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    glossary: {
      languageCodesSet: {
        languageCodes: GLOSSARY_LANGS,
      },
      name: `projects/${PROJECT_ID}/locations/${LOCATION}/glossaries/${GLOSSARY_ID}`,
      inputConfig: {
        gcsSource: {
          inputUri: GLOSSARY_URI,
        },
      },
    },
  };
  console.log('Creating glossary resource...');
  // Create glossary using a long-running operation
  const [operation] = await translationClient.createGlossary(request);

  // Wait for the operation to complete
  await operation.promise();

  console.log('Created glossary:');
  console.log(`InputUri ${request.glossary.inputConfig.gcsSource.inputUri}`);
}

async function deleteGlossaryResource() {
  const request = {
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    name: `projects/${PROJECT_ID}/locations/${LOCATION}/glossaries/${GLOSSARY_ID}`,
  };
  console.log('Deleting glossary resource...');
  // Delete glossary using a long-running operation
  const [operation] = await translationClient.deleteGlossary(request);

  // Wait for operation to complete.
  const [response] = await operation.promise();

  console.log(`Deleted glossary: ${response.name}`);
}

async function translateTextWithGlossary(stringOfText, sourceLanguageCode, targetLanguageCode) {
  const glossaryConfig = {
    glossary: `projects/${PROJECT_ID}/locations/${LOCATION}/glossaries/${GLOSSARY_ID}`,
  };

  const request = {
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    contents: [stringOfText],
    mimeType: 'text/plain',
    sourceLanguageCode: sourceLanguageCode,
    targetLanguageCode: targetLanguageCode,
  };

  // only use the glossary if it includes the langages we are translating to and from
  if (GLOSSARY_LANGS.includes(sourceLanguageCode) && GLOSSARY_LANGS.includes(targetLanguageCode)) {
    request.glossaryConfig = glossaryConfig;
  }

  const [response] = await translationClient.translateText(request);

  let translations;

  // if we used the glossary, the translations will end up in response.glossaryTranslations
  // otherwise, it will end up in response.translations
  if (response.glossaryTranslations.length) {
    translations = response.glossaryTranslations;
  } else {
    translations = response.translations;
  }

  for (const translation of translations) {
    console.log(`Translation: ${translation.translatedText}`);
  }
}

module.exports = {
  uploadNewGlossaryFileToBucket,
  createGlossaryResource,
  deleteGlossaryResource,
  translateTextWithGlossary,
};
