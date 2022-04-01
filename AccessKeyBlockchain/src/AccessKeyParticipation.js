const fs = require('fs');
const crypto = require('crypto');
const request = require('request');

const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyManagement = new AccessKeyManagement();
const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyParticipation
 * 출입키 블록체인 참여 정보 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyParticipation {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 참여 정보 관리 모듈 초기화');
  }

  /*
   * serverNetworkKeyEncrypt
   * 서버의 네트워크 키 암호화 메소드
   * 서버의 네트워크 키로 자신의 공인 IP, 사설 IP를 암호화한다.
   * @version: 0.0.1
   * @param: ip: String
   * @return: data: String
   */
  serverNetworkKeyEncrypt(data) {
    const serverNetworkKey = fs.readFileSync(__dirname + '/../files/ServerNetworkKey.pem', 'utf8');

    return crypto
      .publicEncrypt(
        {
          key: serverNetworkKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        data
      )
      .toString('base64');
  }

  /*
   * reqParticipation
   * 출입키 블록체인 네트워크 참여 요청 메소드
   * 현재 동작 중인 출입키 블록체인 네트워크의 노드 중 하나로, 네트워크 참여를 요청한다.
   * @version: 0.0.1
   * @param: {pubIp: String, priIp: String, networkKey: String, transactionKey: String}: Json
   * @return: {error: Json, body: Json}: Promise<Json>
   */
  async reqParticipation(network) {
    function participationNetworkKeyEncrypt(network) {
      const networkKey = network.networkKey;

      return crypto
        .publicEncrypt(
          {
            key: networkKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
          },
          keyIpAddress.address()
        )
        .toString('base64');
    }

    const participationRequest = (network) => {
      return new Promise((resolve, reject) => {
        const config = JSON.parse(fs.readFileSync(__dirname + '/../files/config.json', 'utf8'));

        const options = {
          uri: `http://${network.priIp}:${config.port}/reqLocalParticipation`,
          method: 'POST',
          form: {
            priIp: participationNetworkKeyEncrypt(network),
            networkKey: fs.readFileSync(__dirname + '/../keys/NetworkKey/NetworkEncryptKey.pem', 'utf8'),
            transactionKey: fs.readFileSync(__dirname + '/../keys/TransactionKey/TransactionDecryptKey.pem', 'utf8'),
          },
        };

        request.post(options, function (error, response, body) {
          resolve(JSON.stringify({ error: error, body: body }));
        });
      });
    };

    return participationRequest(network);
  }

  /*
   * networkKeyDecrypt
   * 출입키 블록체인 네트워크 참여 요청 검증 메소드
   * 출입키 블록체인 네트워크에 참여를 요청한 노드가 자신의 네트워크 키로 암호화해서 보낸 신뢰할 수 있는 노드인 지 검증한다.
   * @version: 0.0.1
   * @param: ip: String
   * @return: ip: String
   */
  networkKeyDecrypt(data) {
    try {
      const networkDecryptKey = fs.readFileSync(__dirname + '/../keys/NetworkKey/NetworkDecryptKey.pem', 'utf8');

      const decryptedData = crypto.privateDecrypt(
        {
          key: networkDecryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data, 'base64')
      );

      return decryptedData.toString();
    } catch (e) {
      return 'Decryption error';
    }
  }

  /*
   * reqLocalParticipation
   * 출입키 블록체인 네트워크 참여 요청 저장 메소드
   * 트랜잭션 키와 네트워크 키의 일치 여부를 검사한 후, 새로운 노드인지, 참여를 재요청 중인 노드인 지 검사 후, 네트워크 파일에 기록한다.
   * @version: 0.0.1
   * @param: priIp: String, networkKey: String, transactionKey: String
   * @return: {priIp: String, networkKey: String, transactionKey: String}: Json
   */
  reqLocalParticipation(priIp, networkKey, transactionKey) {
    const networkJson = { priIp: priIp, networkKey: networkKey, transactionKey: transactionKey };
    let network = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    for (let i = 0; i < network.length; i++) {
      if (network[i].networkKey === networkJson.networkKey || network[i].transactionKey === networkJson.transactionKey) {
        network[i] = networkJson;
        fs.writeFileSync(__dirname + '/../files/Network.json', JSON.stringify(network), 'utf8');
        return networkJson;
      }
    }

    network.push(networkJson);
    fs.writeFileSync(__dirname + '/../files/Network.json', JSON.stringify(network), 'utf8');
    return networkJson;
  }

  /*
   * getNetworks
   * 블록체인 네트워크 정보 반환 메소드
   * 자신이 가지고 있는 블록체인 네트워크 정보와 자신의 네트워크 정보를 참여 요청 노드에 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: {priIp: String, networkKey: String, transactionKey: String}: Json
   */
  getNetworks() {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    let networks = JSON.parse(fs.readFileSync(__dirname + '/../files/Network.json', 'utf8'));
    const network = { priIp: keyIpAddress.address(), networkKey: networkKey, transactionKey: transactionKey };

    networks.push(network);
    return networks;
  }

  /*
   * saveNetworks
   * 출입키 블록체인 네트워크 저장 메소드
   * 파라매터로 받은 출입키 블록체인 네트워크 정보를 파일에 저장한다.
   * 자신의 정보는 저장하지 않는다.
   * @version: 0.0.1
   * @param: {priIp: String, networkKey: String, transactionKey: String}: Json
   * @return: true: Boolean
   */
  saveNetworks(networks) {
    const networkKey = keyManagement.getNetworkEncrptKey();
    const transactionKey = keyManagement.getTransactionDecryptKey();

    let network = [];

    for (let i = 0; i < networks.length; i++) {
      if (networks[i].networkKey === networkKey || networks[i].transactionKey === transactionKey) {
        continue;
      } else {
        network.push(networks[i]);
      }
    }

    fs.writeFileSync(__dirname + '/../files/Network.json', JSON.stringify(network), 'utf8');
    return true;
  }
}

module.exports.AccessKeyParticipation = AccessKeyParticipation;
