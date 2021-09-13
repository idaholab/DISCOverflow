# Copyright 2021, Battelle Energy Alliance, LLC
docker build . -t discoverflow && docker run -t -d  --name discoverflow -p 8080:8080 discoverflow