import { z } from "zod";
import { PyBridge } from "../../src/bridge";

test("script", async () => {
  const bridge = new PyBridge({ python: "python3", cwd: __dirname });

  const schema = z.object({
    word_sizes: z.function(z.tuple([z.array(z.string())]), z.array(z.number())),
  });

  const api = bridge.controller("script.py", schema);
  const sizes = await api.word_sizes(["hello", "world"]);
  expect(sizes).toEqual([5, 5]);

  bridge.close();
});

test("script code", async () => {
  const bridge = new PyBridge({ python: "python3", cwd: __dirname });

  const schema = z.object({
    embed: z.function(z.tuple([z.string()]), z.array(z.number())),
  });

  const code = `
def embed(text):
    return [len(text)]
    `;

  const api = bridge.controller(code, schema);

  const result = await api.embed("hello");
  expect(result).toEqual([5]);
  bridge.close();
});
