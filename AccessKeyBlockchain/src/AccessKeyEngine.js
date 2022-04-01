const fs = require('fs');
const crypto = require('crypto');
const sha256 = require('sha256');

const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyManagement = new AccessKeyManagement();
const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyEngine
 * 출입키 블록체인 엔진 모듈
 * @version: 0.0.1
 */
class AccessKeyEngine {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 엔진 모듈 초기화');
  }

  /*
   * signature
   * 블록 무결성 유지 메소드
   * 블록의 무결성을 유지하기 위해, 블록의 내용을 자신의 트랜잭션 키로 암호화한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  signature(block) {
    const encryData = sha256(block.previousEncryValue + JSON.stringify(block.transaction));

    const transactionEncryptKey = keyManagement.getTransactionEncryptKey();

    const sign = crypto
      .publicEncrypt(
        {
          key: transactionEncryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        encryData
      )
      .toString('base64');

    block.encryValue = sign;

    keyLog.writeAccessKeyLog('Info', 200, `블록 암호화 완료`);

    return block;
  }

  /*
   * checkBlockIntegrity
   * 블록 무결성 검증 메소드
   * 파라매터로 전송받은 블록의 무결성을 검증하고 결과를 반환한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: Boolean
   */
  checkBlockIntegrity(block) {
    try {
      const encryData = sha256(block.previousEncryValue + JSON.stringify(block.transaction));

      const transactionKey = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'))
        .map((v1) => {
          return v1.transactionKey;
        })
        .filter((v2) => {
          return v2.split('\n')[1] === block.transactionKey;
        })[0];

      const decryptedData = crypto.privateDecrypt(
        {
          key: transactionKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(block.encryValue, 'base64')
      );
      keyLog.writeAccessKeyLog('Info', 200, `블록 무결성 검증 성공`);

      return encryData === decryptedData.toString();
    } catch (e) {
      keyLog.writeAccessKeyLog('Info', 200, `블록 무결성 검증 실패`);

      return false;
    }
  }

  /*
   * saveParticipationBlock
   * 참여 요청 블록 저장 메소드
   * 참여 요청 블록에 포함된 정보를 복호화하고, 네트워크 파일에 참여 요청 정보를 기록하며, 블록체인에 참여 요청 블록을 저장한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: true: Boolean
   */
  saveParticipationBlock(block) {
    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));
    chain.push(block);
    fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(chain), 'utf8');

    const transactionKey = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'))
      .map((v1) => {
        return v1.transactionKey;
      })
      .filter((v2) => {
        return v2.split('\n')[1] === block.transactionKey;
      })[0];

    const decryptedData = crypto.privateDecrypt(
      {
        key: transactionKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(block.transaction.reqPriIp, 'base64')
    );

    let network = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    const networkJson = { priIp: decryptedData.toString(), networkKey: block.transaction.reqNetworkKey, transactionKey: block.transaction.reqTransactionKey };

    for (let i = 0; i < network.length; i++) {
      if (network[i].networkKey === networkJson.networkKey || network[i].transactionKey === networkJson.transactionKey) {
        network[i] = networkJson;
        fs.writeFileSync(__dirname + '/../files/Network.json', JSON.stringify(network), 'utf8');

        keyLog.writeAccessKeyLog('Info', 200, `참여 요청 블록 저장 완료`);

        return true;
      }
    }

    network.push(networkJson);
    fs.writeFileSync(__dirname + '/../files/Network.json', JSON.stringify(network), 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, `참여 요청 블록 저장 완료`);

    return true;
  }

  /*
   * saveAccessKeyBlock
   * 출입키 블록 저장 메소드
   * 배포받은 출입키 블록을 블록체인에 저장한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: true: Boolean
   */
  saveAccessKeyBlock(block) {
    let chain = JSON.parse(fs.readFileSync(__dirname + '/../files/Blockchain.json', 'utf8'));
    chain.push(block);
    fs.writeFileSync(__dirname + '/../files/Blockchain.json', JSON.stringify(chain), 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, `출입키 블록 저장 완료`);

    return true;
  }

  /*
   * checkChainIntegrity
   * 블록체인 무결성 검증 메소드
   * 출입키 블록체인 전체의 무결성을 검증하고, 결과를 반환한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: Boolean
   */
  checkChainIntegrity(chain) {
    try {
      const networkKey = keyManagement.getNetworkEncrptKey();
      const transactionKey = keyManagement.getTransactionDecryptKey();

      let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
      const network = { priIp: keyIpAddress.address(), networkKey: networkKey, transactionKey: transactionKey };

      networks.push(network);

      let keys = {};
      networks.map((v) => {
        keys[v.transactionKey.split('\n')[1]] = v.transactionKey;
      });

      for (let i = 0; i < chain.length; i++) {
        if (i !== 0 && chain[i].previousEncryValue !== chain[i - 1].encryValue) return false;
        if (chain[i].blockNumber !== i) return false;
        if (i !== 0 && parseInt(chain[i - 1].timestamp) > parseInt(chain[i].timestamp)) return false;

        const encryData = sha256(chain[i].previousEncryValue + JSON.stringify(chain[i].transaction));

        const decryptedData = crypto.privateDecrypt(
          {
            key: keys[chain[i].transactionKey],
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
          },
          Buffer.from(chain[i].encryValue, 'base64')
        );

        if (encryData !== decryptedData.toString()) return false;
      }

      keyLog.writeAccessKeyLog('Info', 200, `블록체인 무결성 검증 성공`);

      return true;
    } catch (e) {
      keyLog.writeAccessKeyLog('Info', 200, `블록체인 무결성 검증 실패`);

      return false;
    }
  }
}

module.exports.AccessKeyEngine = AccessKeyEngine;
