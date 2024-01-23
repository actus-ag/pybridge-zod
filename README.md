# PyBridge

A TypeScript library to access your python functions in NodeJS, type-safe and easy to use.

This is especially useful if you want to use machine learning models in NodeJS.

Forked from the original PyBridge because it gives me too many TS compiler headaches. Doesn't support rxjs Subject streaming :(

## Use-cases

- Call arbitrary Python functions from NodeJS
- Use machine learning models in NodeJS
- Fine-Tune machine learning models from data coming from NodeJS (like Typescript ORMs)
- Text-Embedding from and to your database managed by NodeJS/TypeScript

## Usage

### Python

```python
# File: script.py
from typing import List

def word_sizes(words: List[str]) -> List[int]:
    return [len(word) for word in words]
```

### TypeScript

```typescript
// File: app.ts
import { PyBridge } from "pybridge";

const bridge = new PyBridge({ python: "python3", cwd: __dirname });

const wordSizesSchema = z.object({
  word_sizes: z.function(z.tuple([z.array(z.string())]), z.array(z.number())),
});

const api = bridge.controller("script.py", wordSizesSchema);
const sizes = await api.word_sizes(["hello", "world"]);

expect(sizes).toEqual([5, 5]);

bridge.close();
```

In order to not pass the controller type to the controller function all the time, you can prepare your own controller class like that

```typescript
// file: python-controller.ts

const wordSizesSchema = z.object({
  word_sizes: z.function(z.tuple([z.array(z.string())]), z.array(z.number())),
});

const nlpSchema = z.object({
  embed: z.function(z.tuple([z.string()]), z.array(z.number())),
});

class PythonController {
  script = this.python.controller("script.py", wordSizesSchema);
  nlp = this.python.controller("nlp.py", nlpSchema);

  constructor(protected python: PyBridge) {}
}
```

And then use `PythonController` everywhere.

## Python code

Alternatively instead of providing a module name script path, you can also provide a Python code
directly:

```typescript
const code = `
def embed(text):
    return [len(text)]
    `;

const controller = python.controller(code);
```

## Install

First install pybridge using npm:

```shell
npm install pybridge-zod
```

## How it works

PyBridge starts a Python process and communicates with it via stdin/stdout.

It uses zod to serialize data between the two processes.
