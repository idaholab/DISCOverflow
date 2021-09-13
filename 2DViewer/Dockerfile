# Copyright 2021, Battelle Energy Alliance, LLC
FROM ubuntu:20.10

WORKDIR /
RUN apt update
RUN apt install nodejs openjdk-11-jre -y
RUN apt install npm -y
RUN npm install --global yarn

COPY server server
COPY client client

WORKDIR /client
RUN yarn install
RUN yarn run build

WORKDIR /server
RUN ./gradlew
COPY entry.sh entry.sh
ENTRYPOINT ["./entry.sh"]

# ENTRYPOINT ["/bin/bash"]

