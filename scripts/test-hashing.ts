
import { SHA256 } from '../src/lib/sha256';

async function testHashing() {
  const sha256 = new SHA256();
  const testString = "Hello, World!";
  sha256.update(testString);
  const hash = sha256.hex();
  
  // Known SHA-256 for "Hello, World!": dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f
  const expected = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";
  
  console.log("Input:", testString);
  console.log("Calculated:", hash);
  console.log("Expected:  ", expected);
  
  if (hash === expected) {
    console.log("✅ SHA-256 implementation is correct");
  } else {
    console.error("❌ SHA-256 implementation is incorrect");
    process.exit(1);
  }
}

testHashing();
