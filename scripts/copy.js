import fs from "fs";
import path from "path";
fs.cpSync(path.resolve(process.cwd(), "src","schema.json"), path.resolve(process.cwd(), "dist", "schema.json"))