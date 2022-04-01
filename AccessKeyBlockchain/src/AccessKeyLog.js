const fs = require('fs');

/*
 * AccessKeyLog
 * 출입키 블록체인 로그 관리 모듈
 * @version: 0.0.1
 */
class AccessKeyLog {
  /*
   * writeAccessKeyLog
   * 출입키 블록체인 로그 기록 메소드
   * 출입키 블록체인 네트워크의 로그를 기록한다.
   * @version: 0.0.1
   * @param: state: String, code: Int, data: String
   * @return: true: Boolean
   */
  writeAccessKeyLog(state, code, data) {
    fs.appendFileSync(__dirname + '/../files/Blockchain.log', `${new Date().toLocaleString()} [${state}] ${code}: ${data}\n`, 'utf8');
    console.log(`${new Date().toLocaleString()} [${state}] ${code}: ${data}`);

    return true;
  }

  /*
   * readAccessKeyLog
   * 출입키 블록체인 로그 반환 메소드
   * 출입키 블록체인 네트워크의 로그를 반환한다.
   * @version: 0.0.1
   * @param: x
   * @return: log: String
   */
  readAccessKeyLog() {
    let datas = fs.readFileSync(__dirname + '/../files/Blockchain.log', 'utf8').split('\n');
    datas.pop();

    return datas;
  }
}

module.exports.AccessKeyLog = AccessKeyLog;
