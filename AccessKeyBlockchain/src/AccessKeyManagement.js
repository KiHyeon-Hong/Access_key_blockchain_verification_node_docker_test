const fs = require('fs');

const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');

const keyLog = new AccessKeyLog();

/*
 * AccessKeyManagement
 * 출입키 블록체인 키 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyManagement {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 키 관리 모듈 초기화');
  }

  /*
   * getNetworkEncrptKey
   * 네트워크 공개키 반환 메소드
   * 자신의 네트워크 공개키를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: data: String
   */
  getNetworkEncrptKey() {
    return fs.readFileSync(__dirname + '/../keys/NetworkKey/NetworkEncryptKey.pem', 'utf8');
  }

  /*
   * getTransactionEncryptKey
   * 트랜잭션 비밀키 반환 메소드
   * 자신의 트랜잭션 비밀키를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: data: String
   */
  getTransactionEncryptKey() {
    return fs.readFileSync(__dirname + '/../keys/TransactionKey/TransactionEncryptKey.pem', 'utf8');
  }

  /*
   * getNetworkDecrptKey
   * 네트워크 비밀키 반환 메소드
   * 자신의 네트워크 비밀키를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: data: String
   */
  getNetworkDecrptKey() {
    return fs.readFileSync(__dirname + '/../keys/NetworkKey/NetworkDecryptKey.pem', 'utf8');
  }

  /*
   * getTransactionDecryptKey
   * 트랜잭션 공개키 반환 메소드
   * 자신의 트랜잭션 공개키를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: data: String
   */
  getTransactionDecryptKey() {
    return fs.readFileSync(__dirname + '/../keys/TransactionKey/TransactionDecryptKey.pem', 'utf8');
  }
}

module.exports.AccessKeyManagement = AccessKeyManagement;
