import { bucket } from "../db/db";

export async function uploadFile(fileName: string, filePath: string) {
  await bucket.upload(filePath, {
    destination: fileName,
    gzip: true,
  });
}

export async function getFile(fileName: string) {
  const file = bucket.file(fileName);
  return file.createReadStream();
}
