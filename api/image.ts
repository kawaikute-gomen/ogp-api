import { NowRequest, NowResponse } from "@vercel/node";
import axios from "axios";
import { JSDOM } from "jsdom";
import sharp from "sharp"


/**
 * OGPタグを取得して、そのcontentをJSON形式で返す.
 * 使用例:
 *    endpoint/api/ogp?url="サイトのURL"
 *
 * @param req HTTP request
 * @param res HTTP responce
 */
export default async function (req: NowRequest, res: NowResponse) {
  const url = getUrlParameter(req);
  if (!url) {
    errorResponce(res);
    return;
  }

  try {
    const r = await axios.get(<string>url, {responseType: "arraybuffer", headers: {"Content-Type": "image/jpeg"}});
    const buf = r.data;
    const item = await sharp(buf).resize(800, null, {
      fit: "inside",
      withoutEnlargement: true,
    }).jpeg({
      quality: 80,
      progressive: true,
    }).toBuffer()

    Object.entries(r.headers).map(([k, v]) => {
      res.setHeader(k, v)
    })
    res.status(200).end(item);
  } catch (e) {
    errorResponce(res);
  }
}

function isValidUrlParameter(url: string | string[]): boolean {
  return !(url == undefined || url == null || Array.isArray(url));
}

function getUrlParameter(req: NowRequest): string | null {
  const { url } = req.query;
  if (isValidUrlParameter(url)) {
    return <string>url;
  }
  return null;
}

function errorResponce(res: NowResponse): void {
  res.status(400).send("error");
}
