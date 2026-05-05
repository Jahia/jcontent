#!/bin/bash
version=$(node -p "require('./package.json').devDependencies['@jahia/cypress']")
echo Using @jahia/cypress@$version...

echo "Copy .tgz files"

if [[ -f .env ]]; then
  source .env
  export $(cat .env | sed 's/=.*//g'| xargs)
else
  source .env.example
  export $(cat .env.example | sed 's/=.*//g'| xargs)
fi

if [ ! -d ./artifacts ]; then
  mkdir -p ./artifacts
fi

if [ -d ./jahia-module ]; then
  cd jahia-module
  echo "Contents of jahia-module"
  ls -al

  if [ -e "pom.xml" ]; then
    mvn clean install
    echo "Looking up snapshot tgz"
    ls -la ./jcontent-test-js-template/target
    find . -type f -name "*-SNAPSHOT.tgz"
    find . -type f -name "*-SNAPSHOT.tgz" -exec cp {} ../artifacts/ \;
  fi
  cd ..
fi

npx --yes --package @jahia/cypress@$version ci.build
