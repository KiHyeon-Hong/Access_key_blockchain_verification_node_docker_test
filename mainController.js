const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { AccessKeyBlockchain } = require('./AccessKeyBlockchain');
const blockchain = new AccessKeyBlockchain();

const serverAddress = blockchain.getServerAddress();

/*
 * 출입키 블록체인 네트워크 참여 요청 API
 */
app.post('/reqParticipation', async (req, res, next) => {
  const address = JSON.parse(await blockchain.getAddress());

  const options = {
    uri: serverAddress + '/reqParticipation',
    method: 'POST',
    form: {
      pubIp: blockchain.serverNetworkKeyEncrypt(address.publicIp),
      priIp: blockchain.serverNetworkKeyEncrypt(address.ip),
      networkKey: blockchain.getNetworkEncrptKey(),
      transactionKey: blockchain.getTransactionDecryptKey(),
    },
  };

  // 서버로부터 출입키 블록체인 네트워크 정보를 받아온다.
  request.post(options, async function (error, response, body) {
    if (error !== null) {
      res.send('Server is not working');
    } else {
      if (JSON.parse(body) === 'Decryption error') {
        res.send('Decryption error');
      } else {
        const networks = JSON.parse(body);

        for (let i = 0; i < networks.length; i++) {
          // 출입키 블록체인 네트워크 정보를 이용하여, 참여를 요청한다.
          const networkResult = JSON.parse(await blockchain.reqParticipation(networks[i]));

          // 참여 요청이 성공하면, 반환받은 블록체인 네트워크 정보를 저장한다.
          if (networkResult.error === null) {
            blockchain.saveNetworks(JSON.parse(networkResult.body));
            break;
          }
        }

        if (networks.length === 0) {
          // 블록체인 네트워크의 첫 노드일 경우, 제네시스 블록을 생성한다.
          blockchain.createGenesisBlock();
        } else {
          // 기존의 블록체인 네트워크가 존재할 경우, 이미 존재하는 블록체인을 받아온다.
          await blockchain.consensusBlock();
        }

        res.send('Successful participation request');
      }
    }
  });
});

/*
 * 출입키 트랜잭션 저장 요청 API
 */
app.post('/saveTransaction', (req, res, next) => {
  res.send(blockchain.saveTransaction(req.body.doorId, req.body.accessKey));
});

/*
 * 출입키 트랜잭션 신뢰성 검증 요청 API
 */
app.post('/reqReliabilityVerification', async (req, res, next) => {
  res.json(await blockchain.reqReliabilityVerification(req.body.doorId, req.body.accessKey));
});

/*
 * 출입키 검색 요청 API
 */
app.post('/reqKey', (req, res, next) => {
  res.json(blockchain.reqKey(req.body.accessKey));
});

/*
 * 출입키 도어락 ID 검색 요청 API
 */
app.post('/reqId', (req, res, next) => {
  res.json(blockchain.reqId(req.body.doorId));
});

/*
 * 출입키 블록체인 로그 요청 API
 */
app.get('/blockLog', (req, res, next) => {
  res.json(blockchain.blockLog());
});

/*
 * 내부용 API
 */

/*
 * 출입키 블록체인 로컬 네트워크 참여 요청 API
 */
app.post('/reqLocalParticipation', async (req, res, next) => {
  const networks = await blockchain.reqLocalParticipation(req.body);
  res.json(networks);
});

/*
 * 출입키 블록체인 로컬 네트워크 참여 요청 검증 API
 */
app.post('/reqLocalValidation', async (req, res, next) => {
  res.send(blockchain.reqLocalValidation(req.body.block));
});

/*
 * 출입키 블록 검증 및 저장 API
 */
app.post('/validationBlock', (req, res, next) => {
  res.send(blockchain.validationBlock(req.body.block));
});

/*
 * 출입키 블록체인 블록 무결성 유지 요청 API
 */
app.get('/reqBlockIntegrity', async (req, res, next) => {
  res.json(await blockchain.reqBlockIntegrity());
});

/*
 * 출입키 블록체인 블록 무결성 유지 API
 */
app.get('/blockIntegrity', (req, res, next) => {
  res.json(blockchain.blockIntegrity());
});

/*
 * 출입키 블록체인 네트워크 무결성 유지 요청 API
 */
app.get('/reqNetworkIntegrity', async (req, res, next) => {
  res.json(await blockchain.reqNetworkIntegrity());
});

/*
 * 출입키 블록체인 네트워크 무결성 유지 API
 */
app.get('/networkIntegrity', (req, res, next) => {
  res.json(blockchain.networkIntegrity());
});

/*
 * 출입키 트랜잭션 신뢰성 검증 API
 */
app.post('/reliabilityVerification', (req, res, next) => {
  res.json(blockchain.reliabilityVerification(req.body.doorId, req.body.accessKey));
});

app.listen(65006, () => {
  blockchain.accessKeyInit();
  console.log(`출입키 블록체인 네트워크가 ${blockchain.address()}:65006에서 동작 중...`);

  // 일정 시간마다 블록체인 네트워크에서 가장 신뢰할 수 있는 블록체인을 받아온다.
  const blockIntegrity = async () => {
    await blockchain.reqBlockIntegrity();
    setTimeout(blockIntegrity, blockchain.getBlockIntegrityTime());
  };
  setTimeout(blockIntegrity, blockchain.getBlockIntegrityTime());
});
