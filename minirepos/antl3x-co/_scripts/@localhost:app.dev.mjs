#!/usr/bin/env zx

await $`
rm -rf _tmp && mkdir _tmp
pnpm -w sops decrypt _cue/!base.enc* _cue/*@localhost.enc*

cue export _cue/* --expression generateEnvVariablesLocalhostFile --out text > _tmp/.env
export $(cat _tmp/.env | xargs)

node_modules/.bin/mddb ./docs/
mv .markdowndb/files.json ./docs/markdowndb.json && rm -rf .markdowndb markdowndb.db

vocs dev
`
