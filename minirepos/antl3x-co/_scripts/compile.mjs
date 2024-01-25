#!/usr/bin/env zx

await $`
node_modules/.bin/mddb ./docs/
mv .markdowndb/files.json ./docs/markdowndb.json && rm -rf .markdowndb markdowndb.db

vocs build
`
