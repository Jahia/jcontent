FROM cypress/base:13.8.0

RUN apt-get update && apt-get install -y jq

RUN adduser --disabled-password jahians

USER jahians
WORKDIR /home/jahians

COPY --chown=jahians:jahians package.json yarn.lock /home/jahians/

RUN mkdir -p /home/jahians/run-artifacts
RUN mkdir -p /home/jahians/results
RUN mkdir -p /home/jahians/cypress/plugins

RUN yarn install

COPY --chown=jahians:jahians . /home/jahians

RUN /home/jahians/node_modules/.bin/cypress install

CMD ["/bin/bash", "-c", "/home/jahians/env.run.sh"]
