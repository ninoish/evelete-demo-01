// import sharp from "sharp";
import { Jimp, ResizeStrategy } from "jimp";
import FormData from "form-data";
import axios from "axios";

async function uploadToCloudflareImages(
  file: File | undefined,
  options: {
    size: {
      width: number;
      height?: number;
    };
    format: "jpg" | "png" | "webp";
  },
) {
  const { CF_ACCOUNT_ID, CF_IMAGES_STREAM_API_KEY } = process.env;

  if (!file || !(file instanceof File)) {
    return null;
  }

  console.log("heyhe2", file.name);

  const fileName = file.name;
  const arrayBuffer = await file.arrayBuffer();
  console.log("heyhe3", file.name);

  const cfForm = new FormData();
  const buffer = Buffer.from(arrayBuffer);
  console.log("heyhe4", file.name);

  const resizedBuffer = await optimize({
    buffer: buffer,
    size: options.size,
    format: options.format,
  });
  console.log("heyhe5", file.name);

  cfForm.append("file", resizedBuffer, {
    filename: fileName,
    contentType: "image/jpeg",
  });

  console.log("heyhey");
  const imgRes = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    cfForm,
    {
      headers: {
        Authorization: `Bearer ${CF_IMAGES_STREAM_API_KEY}`,
        ...cfForm.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    },
  );
  console.log("uploadedimage", imgRes.data);
  return imgRes.data.success ? imgRes.data.result.variants[0] : null;
}

async function optimize({
  buffer,
  size,
  format,
}: {
  buffer: Buffer;
  size: {
    width: number;
    height?: number;
  };
  format: "jpg" | "png" | "webp";
}) {
  const file = await Jimp.read(buffer);
  return (
    file
      // TODO: crop?
      .resize({ w: size.width, h: size.height })
      .getBuffer("image/jpeg", { quality: 75 })
  );

  // CF Workers では、sharp内で使っている c言語ライブラリが使えない模様。jimpにする
  /*
  return await sharp(buffer)
    .resize({ ...size, fit: sharp.fit.inside, withoutEnlargement: true })
    .toFormat(format, {
      quality: 75,
    })
    .withExif({})
    .toBuffer();
    */
}

export default {
  uploadToCloudflareImages,
};
