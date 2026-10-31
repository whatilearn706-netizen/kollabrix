/**
 * Kollabrix Concurrency & Capacity Stress Tester
 * Simulates concurrent student traffic hitting Kollabrix API endpoints.
 *
 * Usage:
 *   node scripts/load-test.js [targetUrl] [concurrency] [requestsPerUser]
 * Example:
 *   node scripts/load-test.js https://www.kollabrix.in 50 2
 */

const targetUrl = (process.argv[2] || 'https://www.kollabrix.in').replace(/\/$/, '');
const concurrency = parseInt(process.argv[3] || '50', 10);
const requestsPerUser = parseInt(process.argv[4] || '2', 10);

console.log('='.repeat(65));
console.log('🚀 KOLLABRIX CONCURRENCY LOAD TEST');
console.log('='.repeat(65));
console.log(`Target:             ${targetUrl}`);
console.log(`Concurrent Users:   ${concurrency}`);
console.log(`Requests per User:  ${requestsPerUser}`);
console.log(`Total Requests:     ${concurrency * requestsPerUser}`);
console.log('='.repeat(65));

async function simulateStudent(id) {
  const results = [];
  const endpoints = [
    { name: 'Health/Homepage', path: '/' },
    { name: 'Explore Projects', path: '/api/explore' },
    { name: 'Student ID Check', path: `/api/verify/college-id?userId=test-sim-${id}` },
  ];

  for (let r = 0; r < requestsPerUser; r++) {
    const target = endpoints[r % endpoints.length];
    const url = `${targetUrl}${target.path}`;
    const start = Date.now();

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': `KollabrixStressBench/1.0 (User-${id})`,
        },
      });

      const latency = Date.now() - start;
      results.push({
        status: res.status,
        ok: res.ok,
        latency,
        name: target.name,
      });
    } catch (err) {
      results.push({
        status: 0,
        ok: false,
        latency: Date.now() - start,
        error: err.message,
        name: target.name,
      });
    }
  }

  return results;
}

async function run() {
  const startTime = Date.now();
  console.log(`\n⏳ Dispatching ${concurrency} virtual students simultaneously...`);

  const promises = [];
  for (let i = 1; i <= concurrency; i++) {
    promises.push(simulateStudent(i));
  }

  const allUserResults = await Promise.all(promises);
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const flatResults = allUserResults.flat();

  let success = 0;
  let throttled429 = 0;
  let server5xx = 0;
  let networkErrors = 0;
  let latencies = [];

  for (const res of flatResults) {
    if (res.ok) success++;
    else if (res.status === 429) throttled429++;
    else if (res.status >= 500) server5xx++;
    else networkErrors++;

    latencies.push(res.latency);
  }

  latencies.sort((a, b) => a - b);
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  console.log('\n' + '='.repeat(65));
  console.log('📊 LOAD TEST BENCHMARK RESULTS');
  console.log('='.repeat(65));
  console.log(`Total Elapsed Time:   ${totalDuration}s`);
  console.log(`Successful Requests:  ${success} / ${flatResults.length} (${((success / flatResults.length) * 100).toFixed(1)}%)`);
  console.log(`429 Throttled (Rate): ${throttled429}`);
  console.log(`5xx Server Errors:    ${server5xx}`);
  console.log(`Network Failures:     ${networkErrors}`);
  console.log('-'.repeat(65));
  console.log(`Avg Response Time:    ${avg} ms`);
  console.log(`p50 (Median):         ${p50} ms`);
  console.log(`p95:                  ${p95} ms`);
  console.log(`p99:                  ${p99} ms`);
  console.log('='.repeat(65));

  if (throttled429 > 0 || server5xx > 0) {
    console.log('⚠️ WARNING: DB or API connection limits were reached during this burst.');
  } else {
    console.log('✅ PASS: All concurrent requests handled without connection errors!');
  }
}

run();
