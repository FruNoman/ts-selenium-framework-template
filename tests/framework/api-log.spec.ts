/** The API call log (src/api/apiLog.ts) — the Java templates' layout, secrets masked; no app, no network. */
import { strict as assert } from "node:assert";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { apiLogEntry, loggedFetch, MAX_BODY, SEPARATOR } from "../../src/api/apiLog.js";

describe("API log", () => {
  it("a call is one block between two separator lines, credentials masked", () => {
    const entry = apiLogEntry({
      method: "POST",
      url: "https://app.example/api/login?next=%2Fhome",
      requestHeaders: [
        ["Authorization", "Bearer abc.def"],
        ["Content-Type", "application/x-www-form-urlencoded"],
      ],
      requestBody: "email=lab%40example.com&password=s3cret&remember=on",
      status: 200,
      ms: 42,
      responseHeaders: [
        ["content-type", "application/json"],
        ["set-cookie", "session=xyz; Path=/; HttpOnly"],
      ],
      responseBody: '{"user":{"id":7,"name":"Lab"},"token":"t0k3n"}',
    });
    console.info(`INFO api${entry}`); // the example block in the run's output

    assert.equal(
      entry,
      [
        "",
        SEPARATOR,
        "REQUEST: POST https://app.example/api/login?next=%2Fhome",
        "Authorization: ***",
        "Content-Type: application/x-www-form-urlencoded",
        "form: email=lab@example.com",
        "form: password=***",
        "form: remember=on",
        "RESPONSE: 200 (42 ms)",
        "content-type: application/json",
        "set-cookie: ***",
        "{",
        '    "user": {',
        '        "id": 7,',
        '        "name": "Lab"',
        "    },",
        '    "token": "***"',
        "}",
        SEPARATOR,
      ].join("\n"),
    );
    assert.equal(SEPARATOR, "_".repeat(100), "100 underscores");
  });

  it("a JSON request body is pretty and masked; a long body is cut; an empty one is left out", () => {
    const entry = apiLogEntry({
      method: "PUT",
      url: "https://app.example/api/notes/1",
      requestHeaders: [["Content-Type", "application/json"]],
      requestBody: '{"apiKey":"k","text":"hi"}',
      status: 200,
      ms: 3,
      responseHeaders: [],
      responseBody: "x".repeat(MAX_BODY + 5),
    });

    assert.ok(
      entry.includes('{\n    "apiKey": "***",\n    "text": "hi"\n}\nRESPONSE: 200 (3 ms)\n'),
      `the request body pretty, the key masked:${entry.slice(0, 400)}`,
    );
    assert.ok(
      entry.endsWith(`\n${"x".repeat(MAX_BODY)}\n… (5 more characters)\n${SEPARATOR}`),
      "the response body cut at MAX_BODY",
    );
    assert.equal(
      apiLogEntry({
        method: "DELETE",
        url: "https://app.example/api/notes/1",
        requestHeaders: [],
        status: 204,
        ms: 1,
        responseHeaders: [],
        responseBody: "",
      }),
      `\n${SEPARATOR}\nREQUEST: DELETE https://app.example/api/notes/1\nRESPONSE: 204 (1 ms)\n${SEPARATOR}`,
      "no body lines without bodies",
    );
  });

  describe("a fetch", () => {
    let server: Server;
    let base: string;

    before(async () => {
      server = createServer((req, res) => {
        res.setHeader("Set-Cookie", ["session=abc; HttpOnly", "remember=1"]);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ path: req.url, accessToken: "secret-value" }));
      });
      await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
      base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    after(async () => {
      await new Promise((done) => server.close(done));
    });

    it("is logged as one message, timed, and its body stays readable", async () => {
      const logged: unknown[][] = [];
      const info = console.info;
      console.info = (...args: unknown[]) => void logged.push(args);
      let response: Response;
      try {
        response = await loggedFetch(`${base}/login`, {
          method: "POST",
          headers: { Cookie: "session=old", Accept: "text/html" },
          body: new URLSearchParams({ email: "lab@example.com", password: "s3cret" }),
        });
      } finally {
        console.info = info;
      }

      assert.equal(logged.length, 1, "one message per call");
      const message = String(logged[0]?.[0]);
      console.info(message);
      assert.ok(
        message.startsWith(`INFO api\n${SEPARATOR}\nREQUEST: POST ${base}/login\n`),
        "the first lines",
      );
      assert.ok(message.includes("\ncookie: ***\n"), "the Cookie masked");
      assert.ok(
        message.includes("\nform: email=lab@example.com\nform: password=***\n"),
        "the form",
      );
      assert.match(message, /\nRESPONSE: 200 \(\d+ ms\)\n/);
      assert.ok(message.includes("\nset-cookie: ***\nset-cookie: ***\n"), "Set-Cookie masked");
      assert.ok(message.includes('\n    "accessToken": "***"\n'), "the token field masked");
      assert.ok(!message.includes("s3cret") && !message.includes("secret-value"), "no secret");
      assert.ok(message.endsWith(`\n${SEPARATOR}`), "the closing line");
      assert.deepEqual(
        await response.json(),
        { path: "/login", accessToken: "secret-value" },
        "the caller still reads the body",
      );
    });
  });
});
