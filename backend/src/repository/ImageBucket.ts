import { bucket } from "../db/db";

export async function uploadFile(fileName: string, filePath: string) {
  await bucket.upload(filePath, {
    destination: fileName,
    gzip: true,
  });
}

export async function deletePictureIfExists(fileName: string) {
  const file = bucket.file(fileName);
  const [exists] = await file.exists();

  if (exists) {
    await file.delete();
    console.log(`Deleted file ${fileName}`);
  } else {
    console.log(`File ${fileName} does not exist`);
  }
}

export async function getFile(fileName: string) {
  const file = bucket.file(fileName);
  return file.createReadStream();
}
