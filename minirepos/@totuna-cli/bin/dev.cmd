@echo off

node_modules/.bin/tsx --no-warnings=ExperimentalWarning "%~dp0\dev" %*
