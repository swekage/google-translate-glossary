# google-translate-glossary

I made this repo to show people how to set up Google Translation API's glossary features.

With this code, you can

- upload a `glossary.csv` file to your Cloud Storage bucket
- create and delete a glossary resource
- use the glossary resource to translate text

The full guide is here [https://medium.com/@swekage/the-ultimate-guide-to-setting-up-google-translates-glossaries-in-javascript-d9cdff41d9ed](https://medium.com/@swekage/the-ultimate-guide-to-setting-up-google-translates-glossaries-in-javascript-d9cdff41d9ed)

## Setup

1. `npm install`
2. Download your service account credentials JSON and put it in the project root. Remember to add the file to your .gitignore so it doesn't get pushed to Github!
3. In `google.js`, replace the following constants with your own values:

- `SERVICE_ACCOUNT_CREDENTIALS`
- `PROJECT_ID`
- `BUCKET_NAME`
- `GLOSSARY_URI`
- `GLOSSARY_LANGS`
- `GLOSSARY_ID`

## Run

1. You can run `node updateGlossary.js` to
   a. delete the current glossary resource
   b. upload `glossary.csv` to your bucket
   c. create the new glossary resource

2. You can run `node translate.js` to translate a few sample strings
