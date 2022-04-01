const fs = require('fs');
const request = require('request');

const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyManagement = new AccessKeyManagement();
const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyIntegrity
 * 출입키 블록체인 무결성 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyIntegrity {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 무결성 관리 모듈 초기화');
  }

  /*
   * getBlockIntegrityTime
   * 출입키 블록체인 무결성 유지 주기 시간 반환 메소드
   * 출입키 블록체인 무결성 유지 주기 시간을 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: time: Number
   */
  getBlockIntegrityTime() {
    return JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8')).blockIntegrity;
  }

  getNetworkIntegrityTime() {
    return JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8')).networkIntegrity;
  }

  // 구현 필요 없을 듯?
  async reqNetworkIntegrity() {
    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8')).map((v) => {
      return v.priIp;
    });
    // networks.push(keyIpAddress.address());

    const integrityRequest = (network) => {
      return new Promise((resolve, reject) => {
        const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));

        const options = {
          uri: `http://${network}:${config.port}/networkIntegrity`,
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

    results = results.map((v, i) => {
      v.body = JSON.parse(v.body);
      if (v.error !== null) {
        v.body.priIp = 'close';
      }
      return v;
    });

    return true;
  }

  networkIntegrity() {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    return {
      priIp: keyIpAddress.address(),
      networkKey: networkKey,
      transactionKey: transactionKey,
    };
  }
}

module.exports.AccessKeyIntegrity = AccessKeyIntegrity;
