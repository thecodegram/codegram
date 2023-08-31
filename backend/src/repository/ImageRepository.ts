import { bucket } from "../db/db";

export class ImageRepository {
  async uploadImage(fileName: string, filePath: string) {
    await bucket.upload(filePath, {
      destination: fileName,
      gzip: true,
    });
  }

  async deleteImageIfExists(fileName: string) {
    const file = bucket.file(fileName);
    const [exists] = await file.exists();

    if (exists) {
      await file.delete();
      console.log(`Deleted file ${fileName}`);
    } else {
      console.log(`File ${fileName} does not exist`);
    }
  }

  async getImage(fileName: string) {
    const file = bucket.file(fileName);
    return file.createReadStream();
  }
}

export const imageRepository = new ImageRepository();
