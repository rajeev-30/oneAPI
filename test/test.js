const axios = require("axios");

const URL = "http://localhost:8000/api/v1/provider";
const DURATION_MS = 30 * 1000; // 30 seconds

let requestCount = 0;
let startTime = Date.now();

async function hitAPI() {
    try {
        await axios.get(URL);
        requestCount++;
    } catch (err) {
        // count even failed requests if needed
        requestCount++;
    }
}

async function runLoadTest() {
    startTime = Date.now();

    while (Date.now() - startTime < DURATION_MS) {
        await hitAPI();
    }

    const endTime = Date.now();
    const durationSec = (endTime - startTime) / 1000;

    console.log("----- Load Test Result -----");
    console.log("Total Requests:", requestCount);
    console.log("Duration (sec):", durationSec.toFixed(2));
    console.log("Requests/sec:", (requestCount / durationSec).toFixed(2));
}

runLoadTest();