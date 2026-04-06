import fetch from "node-fetch";
import appendFile from "node:fs/promises";
import "dotenv/config";

const START_ID = 0;
const END_ID = 11304;

const CONTRACT = "0x31385d3520bced94f77aae104b406994d8f2168c";
const EXPECTED_CID = process.env.ROOT_FOLDER_CID;
const EXPECTED_PREFIX = `ipfs://${EXPECTED_CID}/`;

const API_KEY = process.env.OS_API_KEY;

const RETRIES = 3;
const DELAY_MS = 500;

const CORRECT_FILE = "os-metadata-correct.jsonl";
const INCORRECT_FILE = "os-metadata-incorrect.jsonl";
const FAILED_FILE = "os-metadata-failed.jsonl";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getToken(tokenId, attempt = 1) {
  const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${CONTRACT}/nfts/${tokenId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (attempt < RETRIES) {
      console.log(`Retry ${attempt} for ${tokenId}...`);
      await delay(500 * attempt);
      return getToken(tokenId, attempt + 1);
    }

    throw err;
  }
}

async function main() {

  let correctCount = 0;
  let incorrectCount = 0;
  let failedCount = 0;

  for (let i = START_ID; i <= END_ID; i++) {
    try {
      const data = await getToken(i);
      const metadataUrl = data?.nft?.metadata_url ?? null;
      const expectedUrl = `${EXPECTED_PREFIX}${i}`;

      if (metadataUrl === expectedUrl) {
        console.log(`OK ${i}`);
        correctCount++;

        await appendFile(
          CORRECT_FILE,
          JSON.stringify({
            tokenId: i,
            metadata_url: metadataUrl,
          }) + "\n"
        );
      } else {
        console.log(`MISMATCH ${i}`);
        incorrectCount++;

        await appendFile(
          INCORRECT_FILE,
          JSON.stringify({
            tokenId: i,
            metadata_url: metadataUrl,
            expected: expectedUrl,
          }) + "\n"
        );
      }
    } catch (err) {
      console.error(`Failed ${i}:`, err.message);
      failedCount++;

      await appendFile(
        FAILED_FILE,
        JSON.stringify({
          tokenId: i,
          error: err.message,
        }) + "\n"
      );
    }

    await delay(DELAY_MS);
  }

  console.log("done.");
  console.log(`Correct: ${correctCount}`);
  console.log(`Incorrect: ${incorrectCount}`);
  console.log(`Failed: ${failedCount}`);
}

main();