import products from './products.json';
import fs from "fs";
import pinataSDK from "@pinata/sdk"; 

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
const NEXT_PUBLIC_JWT_PUBLIC = process.env.NEXT_PUBLIC_JWT_PUBLIC;

export default async function handler(req, res) {


  const pinata = pinataSDK('ef49b1360c72a9888fe0', '5b9e0d382a1a2312ab47ed93d74cdc6d4eebcb8a49a273c7b94fb214ded83987');


  console.log('PINATAAAAA', pinata)

  if (req.method === "POST") {
    try {
      // console.log("body is ", req.body)
      const { name, price, image_url, description, filename, hash, file } = req.body;

      const options = {
        pinataMetadata: {
          name: filename,
        }
      }
      console.log('imagen', image_url)
      // const pinataR = await pinata.pinFileToIPFS(file, options);
      const pinataR = await pinata.pinByHash(hash, options)

      console.log('pinata: ', pinataR)

      // Create new product ID based on last product ID
      const maxID = products.reduce((max, product) => Math.max(max, product.id), 0);
      products.push({
        id: maxID + 1,
        name,
        price,
        image_url: `https://gateway.ipfscdn.io/ipfs/${hash}`,
        description,
        filename,
        hash,
      });
      fs.writeFileSync("./pages/api/products.json", JSON.stringify(products, null, 2));
      res.status(200).send({ status: "ok" });
    } catch (error) {
      console.error('ERROR> ', error);
      res.status(500).json({ error: "error adding product" });
      return;
    }
  }
  else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}