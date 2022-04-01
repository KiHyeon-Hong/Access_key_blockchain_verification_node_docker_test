- docker build . -t blockchainnode
- docker run -p 65006:65006 -d --network="host" blockchainnode

- docker exec -it <container ID> /bin/bash
