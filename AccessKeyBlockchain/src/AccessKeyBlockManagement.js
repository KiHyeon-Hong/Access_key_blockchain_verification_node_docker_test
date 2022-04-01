const fs = require('fs');
const crypto = require('crypto');
const request = require('request');

const { AccessKeyEngine } = require(__dirname + '/AccessKeyEngine.js');
const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyEngine = new AccessKeyEngine();
const keyManagement = new AccessKeyManagement();
const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyBlockManagement
 * 출입키 블록체인 블록 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyBlockManagement {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 블록 관리 모듈 초기화');
  }

  /*
   * createGenesisBlock
   * 제네시스 블록 생성 메소드
   * 출입키 블록체인 네트워크의 첫 노드일 경우, 제네시스 블록을 생성하고 저장한다.
   * @version: 0.0.1
   * @param: x
   * @return: true: Boolean
   */
  createGenesisBlock() {
    const transactionEncryptKey = keyManagement.getTransactionEncryptKey();
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();
    const networkDecryptKey = keyManagement.getNetworkEncrptKey();

    const encryptPriIp = crypto
      .publicEncrypt(
        {
          key: transactionEncryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        keyIpAddress.address()
      )
      .toString('base64');

    const genesisTransaction = { reqPriIp: encryptPriIp, reqNetworkKey: networkDecryptKey, reqTransactionKey: transactionDecryptKey, transactionKey: transactionDecryptKey.split('\n')[1] };

    let genesisBlock = {
      blockNumber: 0,
      timestamp: new Date().getTime(),
      transactionKey: transactionDecryptKey.split('\n')[1],
      encryValue: '',
      previousEncryValue:
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      transaction: genesisTransaction,
    };

    genesisBlock = keyEngine.signature(genesisBlock);

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));
    chain.push(genesisBlock);

    fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(chain), 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, '제네시스 블록 생성 완료');
    return true;
  }

  /*
   * consensusBlock
   * 블록체인 반환 메소드
   * 새로운 노드로 참여 후, 현재 블록체인 네트워크의 블록체인을 자신의 블록체인으로 저장한다.
   * @version: 0.0.1
   * @param: x
   * @return: x
   */
  async consensusBlock() {
    const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));
    const networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });

    for (let i = 0; i < networks.length; i++) {
      const network = networks[i];
      const consensusRequest = (network) => {
        return new Promise((resolve, reject) => {
          const options = {
            uri: `http://${network}:${config.port}/blockIntegrity`,
            method: 'GET',
          };
          request.get(options, function (error, response, body) {
            resolve(JSON.stringify({ error: error, body: body }));
          });
        });
      };

      const blockResult = JSON.parse(await consensusRequest(network));

      if (blockResult.error === null) {
        fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(JSON.parse(blockResult.body)), 'utf8');

        keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 받아오기 완료');
        break;
      }
    }
  }

  /*
   * blockIntegrity
   * 블록체인 반환 메소드
   * 자신의 현재 블록체인을 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  blockIntegrity() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 배포 완료');
    return JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));
  }

  /*
   * createParticipationBlock
   * 참여 여부 블록 생성 메소드
   * 출입키 블록체인 네트워크로 참여 블록을 배포하기 위해, 파라매터로 받은 참여 트랜잭션을 이용하여 블록을 생성한다.
   * @version: 0.0.1
   * @param: {reqPriIp: String, reqNetworkKey: String, reqTransactionKey: String, transactionKey: String}: Json
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  createParticipationBlock(pendingTransaction) {
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));

    let block = {
      blockNumber: chain.length,
      timestamp: new Date().getTime(),
      transactionKey: transactionDecryptKey.split('\n')[1],
      encryValue: '',
      previousEncryValue: chain[chain.length - 1].encryValue,
      transaction: pendingTransaction,
    };

    block = keyEngine.signature(block);

    chain.push(block);
    fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(chain), 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, '참여 블록 생성 완료');
    return block;
  }

  /*
   * deployParticipationBlock
   * 참여 요청 블록 배포 메소드
   * 자신에게 요청된 참여 정보의 무결성이 확인된 후, 블록체인 네트워크로 참여 요청 정보가 포함된 블록을 배포한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: x
   */
  deployParticipationBlock(block) {
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();

    const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));
    const networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });

    const decryptedData = crypto
      .privateDecrypt(
        {
          key: transactionDecryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(block.transaction.reqPriIp, 'base64')
      )
      .toString();

    networks.map((v) => {
      if (decryptedData !== v) {
        const options = {
          uri: `http://${v}:${config.port}/reqLocalValidation`,
          method: 'POST',
          form: {
            block: block,
          },
        };
        request.post(options, function (error, response, body) {
          if (error !== null) {
            keyLog.writeAccessKeyLog('Info', 200, `${v}에 참여 블록 배포 실패`);
          } else {
            keyLog.writeAccessKeyLog('Info', 200, `${v}에 참여 블록 배포 성공`);
          }
        });
      }
    });
  }

  /*
   * saveParticipationBlock
   * 참여 요청 블록 저장 메소드
   * 참여 요청 블록의 무결성을 검증한 후, 검증된 블록을 블록체인에 저장한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: Boolean
   */
  saveParticipationBlock(block) {
    // 추후 블록 번호도 검사하기, 만약 안맞으면, 신뢰할 수 있는 블록 가져온 후 저장하기
    // 배포받은 블록 무결성 검사
    block.blockNumber = parseInt(block.blockNumber);
    block.timestamp = parseInt(block.timestamp);

    if (keyEngine.checkBlockIntegrity(block)) {
      keyEngine.saveParticipationBlock(block);

      keyLog.writeAccessKeyLog('Info', 200, `참여 블록 저장 완료`);

      return true;
    } else {
      keyLog.writeAccessKeyLog('Info', 200, `참여 블록 저장 실패`);

      return false;
    }
  }

  /*
   * createAccessKeyBlock
   * 출입키 블록 생성 메소드
   * 출입키 트랜잭션을 이용하여 출입키 블록을 생성하고, 저장한 후, 반환한다.
   * @version: 0.0.1
   * @param: {doorId: String, accessKey: String, transactionKey: String}: Json
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  createAccessKeyBlock(pendingTransaction) {
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));

    let block = {
      blockNumber: chain.length,
      timestamp: new Date().getTime(),
      transactionKey: transactionDecryptKey.split('\n')[1],
      encryValue: '',
      previousEncryValue: chain[chain.length - 1].encryValue,
      transaction: pendingTransaction,
    };

    block = keyEngine.signature(block);

    chain.push(block);
    fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(chain), 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, `출입키 블록 생성 완료`);

    return block;
  }

  /*
   * deployAccessKeyBlock
   * 출입키 블록 배포 메소드
   * 출입키 블록체인 네트워크로, 생성한 출입키 블록을 배포한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: x
   */
  deployAccessKeyBlock(block) {
    const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));
    const networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });

    networks.map((v) => {
      const options = {
        uri: `http://${v}:${config.port}/validationBlock`,
        method: 'POST',
        form: {
          block: block,
        },
      };
      request.post(options, function (error, response, body) {
        if (error !== null) {
          keyLog.writeAccessKeyLog('Info', 200, `${v}에 출입키 블록 배포 실패`);
        } else {
          keyLog.writeAccessKeyLog('Info', 200, `${v}에 출입키 블록 배포 성공`);
        }
      });
    });
  }

  /*
   * validationBlock
   * 출입키 블록 저장 메소드
   * 배포받은 출입키 블록의 무결성을 검증한 후, 검증된 블록을 블록체인에 저장한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: Boolean
   */
  validationBlock(block) {
    block.blockNumber = parseInt(block.blockNumber);
    block.timestamp = parseInt(block.timestamp);

    if (keyEngine.checkBlockIntegrity(block)) {
      keyEngine.saveAccessKeyBlock(block);

      keyLog.writeAccessKeyLog('Info', 200, `출입키 블록 저장 완료`);

      return true;
    } else {
      keyLog.writeAccessKeyLog('Info', 200, `출입키 블록 저장 실패`);

      return false;
    }
  }

  /*
   * reqReliabilityVerification
   * 출입키 무결성 검증 요청 메소드
   * 출입키 블록체인 네트워크로 사용자가 요청한 출입키와 도어락이 존재하는 지 검증을 요청한다.
   * 모든 블록체인 노드에 요청하며, 과반수 이상 무결한 정보로 평가한다면, 최종적으로 무결한 출입키와 도어락이다.
   * @version: 0.0.1
   * @param: doorId: String, accessKey: String
   * @return: Boolean
   */
  async reqReliabilityVerification(doorId, accessKey) {
    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });
    networks.push(keyIpAddress.address());

    const reliabilityRequest = (network) => {
      return new Promise((resolve, reject) => {
        const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));

        const options = {
          uri: `http://${network}:${config.port}/reliabilityVerification`,
          method: 'POST',
          form: {
            doorId: doorId,
            accessKey: accessKey,
          },
        };

        request.post(options, function (error, response, body) {
          resolve(JSON.stringify({ error: error, body: body }));
        });
      });
    };

    let result = (
      await Promise.all(
        networks.map((v) => {
          return reliabilityRequest(v);
        })
      )
    ).map((v) => {
      return JSON.parse(v);
    });

    let success = 0;
    let fail = 0;

    for (let i = 0; i < result.length; i++) {
      if (result[i].error === null) {
        if (parseInt(result[i].body) === -1) fail++;
        else success++;
      }
    }

    keyLog.writeAccessKeyLog('Info', 200, `출입키 무결성 검증 요청`);

    return success >= fail ? true : false;
  }

  /*
   * reliabilityVerification
   * 출입키 무결성 검증 메소드
   * 요청받은 출입키와 도어락이 블록체인에 존재하는 지 검증하고, 블록 번호를 반환한다.
   * 만약, 블록체인에 존재하지 않으면, -1이 반환된다.
   * @version: 0.0.1
   * @param: doorId: String, accessKey: String
   * @return: blockNumber: Number
   */
  reliabilityVerification(doorId, accessKey) {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    const network = { priIp: keyIpAddress.address(), networkKey: networkKey, transactionKey: transactionKey };

    networks.push(network);

    let keys = {};
    networks.map((v) => {
      keys[v.transactionKey.split('\n')[1]] = v.transactionKey;
    });

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));

    for (let i = 0; i < chain.length; i++) {
      if (keys[chain[i].transactionKey] !== undefined) {
        if (chain[i].transaction.doorId !== undefined) {
          const decryptedDoorId = crypto
            .privateDecrypt(
              {
                key: keys[chain[i].transactionKey],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
              },
              Buffer.from(chain[i].transaction.doorId, 'base64')
            )
            .toString();

          const decryptedAccessKey = crypto
            .privateDecrypt(
              {
                key: keys[chain[i].transactionKey],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
              },
              Buffer.from(chain[i].transaction.accessKey, 'base64')
            )
            .toString();

          if (decryptedDoorId === doorId && decryptedAccessKey === accessKey) {
            keyLog.writeAccessKeyLog('Info', 200, `출입키 무결성 검증 성공`);

            return chain[i].blockNumber;
          }
        }
      }
    }

    keyLog.writeAccessKeyLog('Info', 200, `출입키 무결성 검증 실패`);

    return -1;
  }

  /*
   * reqKey
   * 출입키 검색 메소드
   * 출입키가 블록체인 네트워크에 존재하는 지 검사 후, 해당 블록을 반환한다.
   * @version: 0.0.1
   * @param: accessKey: String
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  reqKey(accessKey) {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    const network = { priIp: keyIpAddress.address(), networkKey: networkKey, transactionKey: transactionKey };

    networks.push(network);

    let keys = {};
    networks.map((v) => {
      keys[v.transactionKey.split('\n')[1]] = v.transactionKey;
    });

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));

    for (let i = 0; i < chain.length; i++) {
      if (keys[chain[i].transactionKey] !== undefined) {
        if (chain[i].transaction.doorId !== undefined) {
          const decryptedAccessKey = crypto
            .privateDecrypt(
              {
                key: keys[chain[i].transactionKey],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
              },
              Buffer.from(chain[i].transaction.accessKey, 'base64')
            )
            .toString();

          if (decryptedAccessKey === accessKey) {
            keyLog.writeAccessKeyLog('Info', 200, `출입키 검색 성공`);

            return chain[i];
          }
        }
      }
    }

    keyLog.writeAccessKeyLog('Info', 200, `출입키 검색 실패`);

    return -1;
  }

  /*
   * reqId
   * 도어락 검색 메소드
   * 도어락이 블록체인 네트워크에 존재하는 지 검사 후, 해당 블록을 반환한다.
   * @version: 0.0.1
   * @param: doorId: String
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  reqId(doorId) {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    const network = { priIp: keyIpAddress.address(), networkKey: networkKey, transactionKey: transactionKey };

    networks.push(network);

    let keys = {};
    networks.map((v) => {
      keys[v.transactionKey.split('\n')[1]] = v.transactionKey;
    });

    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));

    for (let i = 0; i < chain.length; i++) {
      if (keys[chain[i].transactionKey] !== undefined) {
        if (chain[i].transaction.doorId !== undefined) {
          const decryptedDoorId = crypto
            .privateDecrypt(
              {
                key: keys[chain[i].transactionKey],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
              },
              Buffer.from(chain[i].transaction.doorId, 'base64')
            )
            .toString();

          if (decryptedDoorId === doorId) {
            keyLog.writeAccessKeyLog('Info', 200, `도어락 검색 성공`);

            return chain[i];
          }
        }
      }
    }

    keyLog.writeAccessKeyLog('Info', 200, `도어락 검색 실패`);

    return -1;
  }

  /*
   * reqBlockIntegrity
   * 출입키 블록체인 네트워크 무결성 유지 메소드
   * 블록체인 네트워크의 모든 노드로부터 블록체인을 배포 받은 후, 가장 무결성이 높은 블록체인으로 블록체인을 교체한다.
   * @version: 0.0.1
   * @param: x
   * @return: Boolean
   */
  async reqBlockIntegrity() {
    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });
    networks.push(keyIpAddress.address());

    const integrityRequest = (network) => {
      return new Promise((resolve, reject) => {
        const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));

        const options = {
          uri: `http://${network}:${config.port}/blockIntegrity`,
          method: 'GET',
        };

        request.get(options, function (error, response, body) {
          resolve(JSON.stringify({ error: error, body: body }));
        });
      });
    };

    let results = (
      await Promise.all(
        networks.map((v) => {
          return integrityRequest(v);
        })
      )
    ).map((v) => {
      return JSON.parse(v);
    });

    try {
      const goodChain = results
        .filter((v) => {
          if (v.error !== null) return false;
          return keyEngine.checkChainIntegrity(JSON.parse(v.body));
        })
        .sort((a, b) => {
          return b.body.length - a.body.length;
        })[0].body;

      fs.writeFileSync(__dirname + '/../files/Blockchain.json', goodChain, 'utf8');

      keyLog.writeAccessKeyLog('Info', 200, `블록체인 무결성 유지 완료`);

      return true;
    } catch (e) {
      keyLog.writeAccessKeyLog('Info', 200, `블록체인 무결성 유지 실패`);

      return false;
    }
  }
}

module.exports.AccessKeyBlockManagement = AccessKeyBlockManagement;
