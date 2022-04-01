const crypto = require('crypto');

const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');

const keyManagement = new AccessKeyManagement();
const keyLog = new AccessKeyLog();

/*
 * AccessKeyTransactionManagement
 * 출입키 블록체인 트랜잭션 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyTransactionManagement {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 트랜잭션 관리 모듈 초기화');
  }

  /*
   * createParticipationTransaction
   * 참여 여부 트랜잭션 생성 메소드
   * 출입키 블록체인 네트워크로 참여 블록을 배포하기 위해, 참여 트랜잭션을 생성한다.
   * @version: 0.0.1
   * @param: {priIp: String, networkKey: String, transactionKey: String}: Json
   * @return: {reqPriIp: String, reqNetworkKey: String, reqTransactionKey: String, transactionKey: String}: Json
   */
  createParticipationTransaction(transactionData) {
    const transactionEncryptKey = keyManagement.getTransactionEncryptKey();
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();

    const encryptPriIp = crypto
      .publicEncrypt(
        {
          key: transactionEncryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        transactionData.priIp
      )
      .toString('base64');

    return { reqPriIp: encryptPriIp, reqNetworkKey: transactionData.networkKey, reqTransactionKey: transactionData.transactionKey, transactionKey: transactionDecryptKey.split('\n')[1] };
  }

  /*
   * createAccessKeyTransaction
   * 출입키 트랜잭션 생성 메소드
   * 출입키와 도어락 데이터를 이용하여 출입키 트랜잭션을 생성하고 반환한다.
   * @version: 0.0.1
   * @param: doorId: String, accessKey: String
   * @return: {doorId: String, accessKey: String, transactionKey: String}: Json
   */
  createAccessKeyTransaction(doorId, accessKey) {
    const transactionEncryptKey = keyManagement.getTransactionEncryptKey();
    const transactionDecryptKey = keyManagement.getTransactionDecryptKey();

    const encryptDoorId = crypto
      .publicEncrypt(
        {
          key: transactionEncryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        doorId
      )
      .toString('base64');

    const encryptAccessKey = crypto
      .publicEncrypt(
        {
          key: transactionEncryptKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        accessKey
      )
      .toString('base64');

    return { doorId: encryptDoorId, accessKey: encryptAccessKey, transactionKey: transactionDecryptKey.split('\n')[1] };
  }
}

module.exports.AccessKeyTransactionManagement = AccessKeyTransactionManagement;
