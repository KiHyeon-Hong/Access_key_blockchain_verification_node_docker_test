const ip = require('ip');

const { AccessKeyLog } = require(__dirname + '/AccessKeyLog.js');

const keyLog = new AccessKeyLog();

/*
 * AccessKeyIpAddress
 * 출입키 블록체인 IP 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyIpAddress {
  constructor() {
    keyLog.writeAccessKeyLog('Info', 200, '출입키 블록체인 IP 관리 모듈 초기화');
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
    return ip.address();
  }
}

module.exports.AccessKeyIpAddress = AccessKeyIpAddress;
