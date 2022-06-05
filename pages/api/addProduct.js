import products from './products.json';
import fs from "fs";
import pinataSDK from "@pinata/sdk"; 

export default async function handler(req, res) {

  const pinata = pinataSDK(process.env.API_KEY, process.env.SECRET_KEY);

  if (req.method === "POST") {
    try {
      const { name, price, image_url, description, filename, hash, file } = req.body;

      const options = {
        pinataMetadata: {
          name: filename,
        }
      }
      // const pinataR = await pinata.pinFileToIPFS(file, options);
      const pinataR = await pinata.pinByHash(hash, options)


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
      res.status(500).json({ error: "error adding product" });
      return;
    }
  }
  else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}