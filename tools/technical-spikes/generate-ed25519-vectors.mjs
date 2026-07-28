import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2.js';

ed.hashes.sha512 = sha512;

const priv = ed.etc.hexToBytes('9d61b19deffd5a60ba844af492ec2cc44401c569d40c893265af344b4352f907');
const pub = await ed.getPublicKeyAsync(priv);
const database = new TextEncoder().encode('SQLite format 3\x00-spike-db-sample');
const manifest = new TextEncoder().encode('{"packId":"spike-test","version":1}');
const resource = new TextEncoder().encode('spike-resource-bytes');
const message = ed.etc.concatBytes(database, manifest, resource);
const sig = await ed.signAsync(message, priv);

console.log(
  JSON.stringify(
    {
      publicKey: ed.etc.bytesToHex(pub),
      signature: ed.etc.bytesToHex(sig),
      database: ed.etc.bytesToHex(database),
      manifest: ed.etc.bytesToHex(manifest),
      resource: ed.etc.bytesToHex(resource),
    },
    null,
    2,
  ),
);
