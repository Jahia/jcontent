#!/bin/bash
version=$(node -p "require('./package.json').devDependencies['@jahia/cypress']")
echo Using @jahia/cypress@$version...

npx --yes --package @jahia/cypress@$version set-env

if [ ! -d ./artifacts ]; then
  mkdir -p ./artifacts
fi

if [ -d ./jahia-module ]; then
  cd jahia-module
  if [ -e "pom.xml" ]; then
    mvn clean install
    find . -type f -name "*-SNAPSHOT.tgz" -exec cp {} ../artifacts/ \;
  fi
  cd ..
fi

npx --yes --package @jahia/cypress@$version env.run
