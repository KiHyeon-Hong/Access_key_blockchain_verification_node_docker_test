const { AccessKeyInit } = require(__dirname + '/AccessKeyInit.js');
const { AccessKeyManagement } = require(__dirname + '/AccessKeyManagement.js');
const { AccessKeyParticipation } = require(__dirname + '/AccessKeyParticipation.js');
const { AccessKeyBlockManagement } = require(__dirname + '/AccessKeyBlockManagement.js');
const { AccessKeyTransactionManagement } = require(__dirname + '/AccessKeyTransactionManagement.js');
const { AccessKeyIntegrity } = require(__dirname + '/AccessKeyIntegrity.js');
const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');
const { AccessKeyIpAddress } = require(__dirname + '/AccessKeyIpAddress.js');

const keyInit = new AccessKeyInit();
const keyManagement = new AccessKeyManagement();
const keyParticipation = new AccessKeyParticipation();
const keyBlockManagement = new AccessKeyBlockManagement();
const keyTransactionManagement = new AccessKeyTransactionManagement();
const keyIntegrity = new AccessKeyIntegrity();
const keyLog = new AccessKeyLog();
const keyIpAddress = new AccessKeyIpAddress();

/*
 * AccessKeyBlockchain
 * 출입키 블록체인 인터페이스 모듈
 * @version: 0.0.1
 */
class AccessKeyBlockchain {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 인터페이스 모듈 초기화');
  }

  /*
   * getServerAddress
   * 블록체인 서버 주소 반환 메소드
   * 블록체인 네트워크 참여를 위해, 블록체인 네트워크를 관리 중인 서버의 주소를 반환한다..
   * @version: 0.0.1
   * @param: x
   * @return: serverAddress: String
   */
  getServerAddress() {
    return keyInit.getServerAddress();
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
    return await keyInit.getAddress();
  }

  /*
   * accessKeyInit
   * 출입키 블록체인 검증 초기화 메소드
   * 출입키 블록체인 검증 모듈의 초기화를 위해, 네트워크 키, 트랜잭션 키, 그리고 파일을 생성 및 초기화한다.
   * @version: 0.0.1
   * @param: x
   * @return: true: Boolean
   */
  accessKeyInit() {
    keyInit.networkKeyInit();
    keyInit.transactionKeyInit();
    keyInit.createFiles();

    return true;
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
    return keyManagement.getNetworkEncrptKey();
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
    return keyManagement.getTransactionEncryptKey();
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
    return keyManagement.getNetworkDecrptKey();
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
    return keyManagement.getTransactionDecryptKey();
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
    return keyParticipation.serverNetworkKeyEncrypt(data);
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
    return await keyParticipation.reqParticipation(network);
  }

  /*
   * reqLocalParticipation
   * 출입키 블록체인 네트워크 참여 요청 검증 메소드
   * 참여를 요청한 노드의 신뢰성을 검증한 후, 검증된 노드의 정보를 출입키 블록체인 네트워크에 전파한다.
   * @version: 0.0.1
   * @param: {priIp: String, networkKey: String, transactionKey: String}: Json
   * @return: {priIp: String, networkKey: String, transactionKey: String}: Json
   */
  reqLocalParticipation(transaction) {
    const priIp = keyParticipation.networkKeyDecrypt(transaction.priIp);

    const networkKey = transaction.networkKey;
    const transactionKey = transaction.transactionKey;

    if (priIp === 'Decryption error') {
      return 'Decryption error';
    }

    const transactionData = keyParticipation.reqLocalParticipation(priIp, networkKey, transactionKey);
    const pendingTransaction = keyTransactionManagement.createParticipationTransaction(transactionData);

    // 참여 요청 트랜잭션을 이용하여, 참여 요청 블록을 생성한다.
    const block = keyBlockManagement.createParticipationBlock(pendingTransaction);

    // 생성된 참여 요청 블록을 배포한다.
    keyBlockManagement.deployParticipationBlock(block);

    // 참여를 요청한 노드로, 블록체인 네트워크 정보를 반환한다.
    return keyParticipation.getNetworks();
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
    return keyParticipation.saveNetworks(networks);
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
    return keyBlockManagement.createGenesisBlock();
  }

  /*
   * consensusBlock
   * 블록체인 요청 메소드
   * 새로운 노드로 참여 후, 현재 블록체인 네트워크의 블록체인을 자신의 블록체인으로 저장한다.
   * @version: 0.0.1
   * @param: x
   * @return: x
   */
  async consensusBlock() {
    return await keyBlockManagement.consensusBlock();
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
    return await keyBlockManagement.reqBlockIntegrity();
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
    return keyBlockManagement.blockIntegrity();
  }

  /*
   * reqLocalValidation
   * 참여 요청 블록 저장 메소드
   * 배포된 참여 요청 블록의 무결성을 검증하고, 검증된 참여 요청 네트워크 정보와 블록을 저장한다.
   * @version: 0.0.1
   * @param: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   * @return: Boolean
   */
  reqLocalValidation(block) {
    return keyBlockManagement.saveParticipationBlock(block);
  }

  /*
   * saveTransaction
   * 출입키 저장 메소드
   * 요청받은 출입키와 도어락 정보를 블록체인에 기록하고, 블록체인 네트워크에 전파한다.
   * @version: 0.0.1
   * @param: doorId: String, accessKey: String
   * @return: {blockNumber: Number, timestamp: Number, transactionKey: String, encryValue: String, previousEncryValue: String, transaction: param}: Json
   */
  saveTransaction(doorId, accessKey) {
    const pendingTransaction = keyTransactionManagement.createAccessKeyTransaction(doorId, accessKey);
    const block = keyBlockManagement.createAccessKeyBlock(pendingTransaction);
    keyBlockManagement.deployAccessKeyBlock(block);

    return block;
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
    return keyBlockManagement.validationBlock(block);
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
    return await keyBlockManagement.reqReliabilityVerification(doorId, accessKey);
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
    return keyBlockManagement.reliabilityVerification(doorId, accessKey);
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
    return keyBlockManagement.reqKey(accessKey);
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
    return keyBlockManagement.reqId(doorId);
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
    return keyIntegrity.getBlockIntegrityTime();
  }

  getNetworkIntegrityTime() {
    return keyIntegrity.getNetworkIntegrityTime();
  }

  async reqNetworkIntegrity() {
    return await keyIntegrity.reqNetworkIntegrity();
  }

  networkIntegrity() {
    return keyIntegrity.networkIntegrity();
  }

  /*
   * blockLog
   * 출입키 블록체인 로그 반환 메소드
   * 출입키 블록체인 네트워크의 로그를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: log: String
   */
  blockLog() {
    return keyLog.readAccessKeyLog();
  }

  /*
   * address
   * 사설 IP 반환 메소드
   * 블록체인에 참여 중인 노드의 IP를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: ip: String
   */
  address() {
    return keyIpAddress.address();
  }
}

module.exports.AccessKeyBlockchain = AccessKeyBlockchain;
