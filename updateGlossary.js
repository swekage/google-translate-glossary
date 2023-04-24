const { deleteGlossaryResource, uploadNewGlossaryFileToBucket, createGlossaryResource } = require('./google');

async function updateGlossary() {
  try {
    await deleteGlossaryResource();
  } catch (err) {
    console.error('Failed to deleteGlossaryResource', err);
    console.log('This may not be an issue because it could have never been created or it was already deleted.');
  } finally {
    try {
      await uploadNewGlossaryFileToBucket();
      await createGlossaryResource();
    } catch (err) {
      console.error('Failed to upload or create glossary', err);
    }
  }
}

updateGlossary();
