import { existsSync } from "fs";
import { dirname, join, resolve } from "path";

/**
 * Returns __filename, works in both cjs and esm.
 */
export function getCurrentFileName(): string {
  const e = new Error();
  const initiator = e.stack!.split("\n").slice(2, 3)[0];
  let path = /(?<path>[^(\s]+):[0-9]+:[0-9]+/.exec(initiator)!.groups!.path;
  if (path.indexOf("file") >= 0) {
    path = new URL(path).pathname;
  }
  if (path[0] === "/" && process.platform === "win32") {
    path = path.slice(1);
  }
  return path;
}

export function findParentPath(
  path: string,
  origin: string = dirname(getCurrentFileName())
): string | undefined {
  let current = origin;

  while (!existsSync(join(current, path))) {
    const nextFolder = resolve(current, "..");

    if (nextFolder === current) {
      return undefined;
    }

    current = nextFolder;
  }

  return join(current, path);
}
