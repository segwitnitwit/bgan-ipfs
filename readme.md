# BGAN V2 Metadata (IPFS)

All BGAN V2 metadata and images are stored on IPFS

- Current Metadata folder CID:
[bafybeiaut3bzu5em62kvsj2xd3i33mlq7cx22appps375as2vuw7wbcdmq](https://ipfs.io/ipfs/bafybeiaut3bzu5em62kvsj2xd3i33mlq7cx22appps375as2vuw7wbcdmq)
- Image CIDs: [imageCids.jsonl](imageCids.jsonl)

---

## Pinning Strategy

To ensure redundancy and long-term availability:

- All metadata and images are pinned on:
  - Pinata
  - My personal IPFS node

Anyone can support this endeavor by:
- pinning the image cids found in imageCids.jsonl
- pinning the current metadata folder cid
---

## Updating Metadata

Anytime the metadata is updated the metadata folder CID will be updated here

Update process:

- Modify the relevant metadata file(s)
- Rebuild the full metadata folder
- Pin the updated folder to IPFS (Pinata + IPFS node)
- Obtain the new folder CID
- Update the contract baseURI to:
   ipfs://newCID
- Refresh metadata on marketplaces (OpenSea, Blur)
- Verify all tokens resolve correctly
