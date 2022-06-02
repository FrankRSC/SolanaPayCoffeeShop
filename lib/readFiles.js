
export const readFiles = async (file) => {

  const byteFile = await getAsByteArray(file)
  return byteFile;

}

function readFile(file) {
  return new Promise((resolve, reject) => {
    // Create file reader
    let reader = new FileReader()

    // Register event listeners
    reader.addEventListener("loadend", e => resolve(e.target.result))
    reader.addEventListener("error", reject)

    // Read file
    reader.readAsArrayBuffer(file)
  })
}

async function getAsByteArray(file) {
  return new Uint8Array(await readFile(file))
}