import fetch from "node-fetch";
import appendFile from "node:fs/promises";
import "dotenv/config";

const START_ID = 0;
const END_ID = 11304;

const CONTRACT = "0x31385d3520bced94f77aae104b406994d8f2168c";

const API_KEY = process.env.OS_API_KEY;

const RETRIES = 3;
const DELAY_MS = 300;

// output files
const SUCCESS_FILE = "os-refresh-success.jsonl";
const FAILED_FILE = "os-refresh-failed.jsonl";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshToken(tokenId, attempt = 1) {
  const url = `https://api.opensea.io/api/v2/chain/ethereum/contract/${CONTRACT}/nfts/${tokenId}/refresh`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        accept: "*/*",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    console.log(`Refreshed ${tokenId}`);

    await appendFile(
      SUCCESS_FILE,
      JSON.stringify({
        tokenId,
        status: "success",
        timestamp: new Date().toISOString(),
      }) + "\n"
    );

    return true;
  } catch (err) {
    if (attempt < RETRIES) {
      console.log(`Retry ${attempt} for ${tokenId}...`);
      await delay(500 * attempt);
      return refreshToken(tokenId, attempt + 1);
    }

    console.error(`Failed ${tokenId}:`, err.message);

    await appendFile(
      FAILED_FILE,
      JSON.stringify({
        tokenId,
        status: "failed",
        error: err.message,
        timestamp: new Date().toISOString(),
      }) + "\n"
    );

    return false;
  }
}

async function main() {

  let successCount = 0;
  let failedCount = 0;

  for (let i = START_ID; i <= END_ID; i++) {
    const result = await refreshToken(i);

    if (result) successCount++;
    else failedCount++;

    await delay(DELAY_MS);
  }

  console.log("done.");
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failedCount}`);
}

main();