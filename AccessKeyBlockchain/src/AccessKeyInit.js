const fs = require('fs');
const crypto = require('crypto');

const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyInit
 * 출입키 블록체인 초기설정 모듈
 * @version: 0.0.1
 */
class AccessKeyInit {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 초기설정 모듈 초기화');
  }

  /*
   * getServerAddress
   * 블록체인 서버 주소 반환 메소드
   * 블록체인 네트워크 참여를 위해, 블록체인 네트워크를 관리 중인 서버의 주소를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: serverAddress: String
   */
  getServerAddress() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 서버 IP 불러오기 성공');
    return JSON.parse(fs.readFileSync(__dirname + '/../files/ServerAddress.json', 'utf8')).serverAddress;
  }

  /*
   * getAddress
   * IP 반환 메소드
   * 출입키 블록체인 네트워크에 참여하기 위해, 자신의 공인 IP와 사설 IP를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: {publicIp: String, ip: String}: Promise<Json>
   */
  async getAddress() {
    keyLog.writeAccessKeyLog('Info', 200, '공인 IP, 사설 IP 불러오기 완료');

    const publicIp = await import('public-ip');
    return JSON.stringify({ publicIp: await publicIp.default.v4(), ip: keyIpAddress.address() });
  }

  /*
   * networkKeyInit
   * 출입키 블록체인 네트워크 키 초기화 메소드
   * 출입키 네트워크 참여를 위한 네트워크 키를 초기화 한다.
   * 이때, 네트워크 키가 이미 존재한다면, 초기화되지 않는다.
   * @version: 0.0.1
   * @param: x
   * @return: true: Boolean
   */
  networkKeyInit() {
    const path = __dirname + '/../keys/NetworkKey';
    const files = fs.readdirSync(path);

    if (files.length !== 3) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      });

      fs.writeFileSync(__dirname + '/../keys//NetworkKey/NetworkEncryptKey.pem', publicKey);
      fs.writeFileSync(__dirname + '/../keys//NetworkKey/NetworkDecryptKey.pem', privateKey);

      keyLog.writeAccessKeyLog('Info', 200, '네트워크 키 파일 초기화 완료');
    } else {
      keyLog.writeAccessKeyLog('Info', 200, '네트워크 키 파일이 이미 존재함');
    }

    return true;
  }

  /*
   * transactionKeyInit
   * 출입키 블록체인 트랜잭션 키 초기화 메소드
   * 트랜잭션 및 블록 배포를 위한 트랜잭션 키를 초기화 한다.
   * 이때, 트랜잭션 키가 이미 존재한다면, 초기화되지 않는다.
   * @version: 0.0.1
   * @param: x
   * @return: true: Boolean
   */
  transactionKeyInit() {
    const path = __dirname + '/../keys/TransactionKey';
    const files = fs.readdirSync(path);

    if (files.length !== 3) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      });

      fs.writeFileSync(__dirname + '/../keys//TransactionKey/TransactionEncryptKey.pem', publicKey);
      fs.writeFileSync(__dirname + '/../keys//TransactionKey/TransactionDecryptKey.pem', privateKey);

      keyLog.writeAccessKeyLog('Info', 200, '트랜잭션 키 파일 초기화 완료');
    } else {
      keyLog.writeAccessKeyLog('Info', 200, '트랜잭션 키 파일이 이미 존재함');
    }

    return true;
  }

  /*
   * createFiles
   * 출입키 블록체인 파일 초기화 메소드
   * 출입키 블록체인 검증 모듈의 동작을 위한, 네트워크 파일과 블록체인 파일을 초기화 한다.
   * @version: 0.0.1
   * @param: x
   * @return: true: Boolean
   */
  createFiles() {
    fs.writeFileSync(__dirname + '/../files/Network.json', '[]\n', 'utf8');
    fs.writeFileSync(__dirname + '/../files/Blockchain.json', '[]\n', 'utf8');

    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 검증 모듈 파일 초기화 완료');
    return true;
  }
}

module.exports.AccessKeyInit = AccessKeyInit;
