const BASE_URL = "http://localhost:5000";

const endpoints = [
  "/api/solar/summary",
  "/api/solar/events",
  "/api/solar/latest",
  "/api/solar/critical",
  "/api/solar/events/6633",
];

async function checkEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url);

    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const success =
      response.ok &&
      body &&
      body.success === true;

    return {
      endpoint,
      status: response.status,
      success,
    };
  } catch (error) {
    return {
      endpoint,
      status: "ERROR",
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log("");
  console.log("=================================================");
  console.log("☀️  STAGE 22 — SOLEXS INTEGRATION VALIDATION");
  console.log("=================================================");
  console.log("");

  const results = [];

  for (const endpoint of endpoints) {
    const result = await checkEndpoint(endpoint);

    results.push(result);

    if (result.success) {
      console.log(
        `✅ ${result.endpoint} → ${result.status}`
      );
    } else {
      console.log(
        `❌ ${result.endpoint} → ${result.status}`
      );

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }

  console.log("");
  console.log("=================================================");
  console.log("VALIDATION SUMMARY");
  console.log("=================================================");

  const passed = results.filter(
    (result) => result.success
  ).length;

  const failed = results.length - passed;

  console.log(`Total endpoints : ${results.length}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);

  console.log("");

  if (failed === 0) {
    console.log("=================================================");
    console.log("✅ STAGE 22 SOLEXS API VALIDATION PASSED");
    console.log("=================================================");
  } else {
    console.log("=================================================");
    console.log("❌ STAGE 22 VALIDATION FAILED");
    console.log("=================================================");
  }

  console.log("");
}

main();