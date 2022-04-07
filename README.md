# 출입키 블록체인 검증모듈 게이트웨이

## 소스코드 초기설정 및 실행하기

### 소스코드 다운로드

```bash
git clone https://github.com/KiHyeon-Hong/Access_key_blockchain_verification_node_docker_test.git
```

### 소스코드 초기 설정하기

#### 출입키 블록체인 서버 구성하기

- https://github.com/KiHyeon-Hong/Access_key_blockchain_verification_server_docker_test

#### /AccessKeyBlockchain/files/ServerAddress.json

- serverAddress의 IP 내용을 실제 출입키 블록체인 서버가 동작하는 주소로 변경한다.

```json
{ "serverAddress": "http://203.249.127.32:65005" }
```

#### /AccessKeyBlockchain/files/ServerNetworkKey.pem

- ServerNetworkKEy.pem을 출입키 블록체인 서버의 ServerNetworkKey.pem을 다운로드하여, 추가한다.

```pem
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAopZzfn/2HmkJ/YRCoZdAoz0Nq2d6CiLB8D/tS8kzAjIfSsPHOW9Y
NWNsquca1YACm2RZBtPDJve2bZy0akLMxc4DPVWHrbNBqK0Y/7tiUonwpmeeV3m6
Ikc7Z6TCAKEi/BdDyQM3lS5zfHcC/8ZeXUc2rDKtdcY09wk52VWDohHku4weXWrV
gvTLTE1ltg6thkI2l2Lid3AWaDIvIrWRgpgGnhldE1CzaekPgimBE6ClyRBDNyTo
JA7qBtP9hb2Htd/SQ2eSi4ZDKaPw5w3yUb5GIVHklXB84SNltW5PbZgv+nzLOZtA
rafCHv7YNWFLGp+86UvIBXYY6mJVgLZAxQIDAQAB
-----END RSA PUBLIC KEY-----
```

### Docker image 생성하기

```bash
docker build . -t blockchainnode
```

### Docker image 실행하기

- --network="host"가 없으면, 출입키 블록체인 서버로, 도커의 IP가 전송되므로, 출입키 블록체인 네트워크를 구성할 수 없다.
- 이를 위해, 호스트 IP를 서버로 전송한다.

```bash
docker run -p 65006:65006 -d --network="host" blockchainnode
```

### Docker 접속하기

```bash
docker exec -it <container ID> /bin/bash
```

## 출입키 블록체인 네트워크 사용하기

1. 출입키 블록체인 서버를 실행한다.
2. 출입키 블록체인 서버의 공개키를 다운로드 받아 추가한다.
3. 출입키 블록체인 서버의 IP 주소로 수정한다.
4. Docker 이미지를 생성후, 실행한다.
5. /reqParticipation API로 로컬 환경 내에 블록체인 네트워크를 구축한다.
6. /saveTransaction API로 doorId와 accessKey를 저장한다.
7. /reqReliabilityVerification API로 doorId와 accessKey를 검증한다.
8. 같은 네트워크 내의 또 다른 게이트웨이에 동일하게 수행하면, 로컬 네트워크 내의 블록체인 네트워크가 구축되며, 블록체인을 동기화된다.

## API Document

- localhost는 예시 IP로, 출입키 블록체인 게이트웨이의 IP로 변경한다.

### POST http://localhost:65006/reqParticipation

- 출입키 블록체인 서버로 블록체인 네트워크 구축을 요청한다.

#### 블록체인 네트워크 참여 성공

```text
Successful participation request
```

#### 블록체인 네트워크 참여 실패

```text
Decryption error
```

#### 출입키 블록체인 서버를 찾을 수 없음

```text
Server is not working
```

### POST http://localhost:65006/saveTransaction

- 블록체인 네트워크로 저장을 요청한다.
- 반환 데이터는 암호화된 블록체인 블록이다.

#### 전송 데이터

```json
{
  "doorId": "ad57366865126e55649ecb23ae1d48887544976efea46a48eb5d85a6eeb4d306",
  "accessKey": "13a5c202e320d0bf9bb2c6e2c7cf380a6f7de5d392509fee260b809c893ff2f9"
}
```

#### 반환 데이터

```json
{
  "blockNumber": 13,
  "timestamp": 1648788642769,
  "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I",
  "encryValue": "joatFS52Kbc6q5RlGPbB9yAANnpXG+RbMueGzpRaqH9gGpD3RS1c25okiGDzNghQ8+Ookzio0WSGhXnU73MdbZ6VsDh1gtsUyd2lOWmYHPr/J7qKXTYMkVhxdAerEvPJ60KKM6I1FedTnG9c2gdwp9qvXXHLJ6xz5ZoQMVK6YVHp24j8z/RuKaPQ/G9+ylB/uEIzwGL9elrZ1teP+tvdqp6CWyAyjnBrMbIw6GJrMH0qDq8WuEXPW/1MuWHha+7gdHIJ/N5ZUUqInAU60twmRSWiXyXV6lkUR3t5/t1eyYEGim2vtXKBXiCvARjlcahRIPoZ0SCe91Qt25RlotAJwQ==",
  "previousEncryValue": "zKE+OY51V0qx1bIetvpGosmtlrE6iLGrpbwPWSgNTQOCjEYlDAEEhSdD/mvpCmszGUyHHmi/xPXbn0ewEMbpFDX730FgPLydVIv7n5KmYyye0rPkB4wgjXxEV3ZHIiozGUajClcdxZoIsI9S1h/w1SfDiq51LhbUaP8HQLaEtqHtd/4H5QN7ZWuaYDlI2uiYdnTyRw2WhxL65EZ3P7sqBqXVoWksuYyfwuLMsHdhZGkpzoaYsXnp2VDMAPa316RUH4sNZZBl5uqRRz6CtaXBV2+6PSu6Ug5pHFCK/hzmE6A4Q7gxmGLbrmT4Ez25ITyNBfoRrA+Skv5WW5kyX/p+sA==",
  "transaction": {
    "doorId": "JYbrAiQF2Xt7g4tRRLxS2C8X4X8ATo2KPgfoxJcoIhc2pWUBdQBkSZnP5BI6U3SEJMDhBqDQnnnCmVMsnaKR2Gkz0SxwP+Ew2bSd+fMCULhX2oWGv1f5ap+2wONdsAlYLewOrcmS7Pf0SXxSbwwPGr6dS/mDuME5sDzuv6GtHpY3IS24GH730ixtwRSYf4oV7MJhder7U5oQjL4ZLCMODU9CL/JekrwuW0Lm/zopK5GkxSFBiM4tt31Qs13dzN8bKEQbgn3BQKmq+owEtwTmnYsN3Fx9l8pMJS19XxiqBL750+J4KAkwJT9oZFVu+Ad9jRqosgvCiF2rEve+SeEaaw==",
    "accessKey": "sa3Bn94bCEROHvGvBCorAvVYwLi4iyXwOQobbjM4hfv1vsNmmLdxcjjN/zKgGT5yWmBN/wUMm6wenIpufXdA88979nm/+msn6PqdaE/XwFpARX2SuBUb9x6fcUVE8PI8vS6/vAjshxrKHpIIX87iZpDoIWbPsFwZOuM44Vtj0qwxQsT99z1wpYnoVw7MifPQjtBgy8FEySJG1shjavdtO4GXUy4MTELlrL40jVtbIkRQXa/Qsjy/GNxtCSaM6w8XWshSuzOoS8wjcGDAkUIoWEbnzHK/1LKhHTX9TEEexdUuNa2sHIlM2320mTQuR7JfwPOznyO02ao55C2KSf3P+g==",
    "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I"
  }
}
```

### POST http://localhost:65006/reqReliabilityVerification

- 블록체인 네트워크에 데이터가 존재하는 지 검증한다.
- 데이터가 존재한다면 true, 존재하지 않는다면 false를 반환한다.

#### 전송 데이터

```json
{
  "doorId": "ad57366865126e55649ecb23ae1d48887544976efea46a48eb5d85a6eeb4d306",
  "accessKey": "13a5c202e320d0bf9bb2c6e2c7cf380a6f7de5d392509fee260b809c893ff2f9"
}
```

#### 반환 데이터

```text
true
```

```text
false
```

### POST http://localhost:65006/reqKey

- accessKey가 블록체인 네트워크에 존재하는 지 확인한다.
- 존재한다면 해당하는 accessKey가 암호화되어 있는 블록, 존재하지 않는다면 -1을 반환한다.

#### 전송 데이터

```json
{
  "accessKey": "13a5c202e320d0bf9bb2c6e2c7cf380a6f7de5d392509fee260b809c893ff2f9"
}
```

#### 반환 데이터

```json
{
  "blockNumber": 5,
  "timestamp": 1648780835224,
  "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I",
  "encryValue": "uZxmkBJezy935b90YLcAYs25btUrnC74vdmUfKuQvCrWux9Zf9c+abzv32Sx2y2Q1h/AHNwfK128VNoYQHF7Wd48OkhTOJOFReeV+SM+BG8gilVTK+W/asefXwrw7uci/y+CRNwxloj1xSLolFYUA13d0I2v+LnxOYqLy9poqNEgLVWzum2KaVZF3g7yUua6Hmc5vY7i/gS7OCVZ1brEBPyNz7xw6iqHHmwJNFEg0kAEPxVIQXj9Fs5KTMhkmgaWrQxwWKecppT0n6yBH8geck3UGXbQvNtzpkx7uQC6WvjcOop+J+gliONZOmUW/L/o9bvmTXd9ogCSpeiWSF3HxQ==",
  "previousEncryValue": "J4NqXLlxfW3AtdKm+Ee5lurnWp7ghjIMUECw49hlMPcYg1psdM6+e7rAX3Or16KL9Fv10e2u6ngOnzM5Ig3fK7UY6iMah7WQb1Wl3m9xmHovTEGLpeTsO1kCYn6FGFCuFZTf7cARAMiFQLj8IdCr6HUXMJUBerWsGOZuc3yoFyTklO43iHypNhtnhwRKHJcuA0RPs8kbsRpZF4sIysE6/Zovk2MYUULlljU4qazG1YK88vaKJsDlHS7XKuDR71rtL0hDO7j+kCnAQiUpMhFh/T7OWiGL9rS6XhgPhN8Jd4MNsHeL8evboidX9u05QmNAZ6ikqqSlk2CH2I4yVoHLoQ==",
  "transaction": {
    "doorId": "oWf+ergysdvfccHCy6Ztzyn7lha5prOBH8Sz/Dkg9towb9EiJ2isXtwnkV7hmszzWWHUlF5V37jwqkpHdT6Dd6MI5QfWY7vF9KwumLxB+AkH4cpUb39fR379l5uS+PMVh3RzygSIlM6170gO+PDydxhtM2x0P3h7RV6DbFRDDR+mJWs6/QAmO+coJqE8nZbS50WOPXDokdu8SeP28Vc8/0N72MSrpvWMxJsy89T1guX2O7WIn+OS2FZynulNzRt3f1RKQCEF9RfmgAq2tQHyrPe7ufTrqOA0thg/1qBjmoqzIyYsOz3+KY0MXg6ORGQA3ByAIK2byKvlbLl0F6DdjA==",
    "accessKey": "m9cscqBHfFQ0aXvXrXYVDYpNkukD0lxVP/5ho9hUJh5meMlAt9cB0LaUk8bLo2ReY3Ojf7LkTFtyzWHJOZ/fLUVqg/wb2AlIUnItnyNM15INuu9zpqa+JJotkdu7wODvQWvY27eSjMwbJ9JTWYZ5433Hyl7LMdvFfUI9f2zMDjr5eENkmMRTVB2KXEAHF/Rm+ugTdyeyqx7sRhOBMzADsMXt3tl1gwoNC+fthvxWea1nI1VEzAssLy50jNXJ3TnasAyLQ4LZaN1MKrrqCQwn8ipqCPJ0Ue9NpNdIa9mqQbckxSTyNnaYWIcqaaKBZAI9iCJ8sRlquNxetxkIWdhYmQ==",
    "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I"
  }
}
```

```text
-1
```

### POST http://localhost:65006/reqId

- doorId가 블록체인 네트워크에 존재하는 지 확인한다.
- 존재한다면 해당하는 doorId가 암호화되어 있는 블록, 존재하지 않는다면 -1을 반환한다.

#### 전송 데이터

```json
{
  "doorId": "ad57366865126e55649ecb23ae1d48887544976efea46a48eb5d85a6eeb4d306"
}
```

#### 반환 데이터

```json
{
  "blockNumber": 5,
  "timestamp": 1648780835224,
  "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I",
  "encryValue": "uZxmkBJezy935b90YLcAYs25btUrnC74vdmUfKuQvCrWux9Zf9c+abzv32Sx2y2Q1h/AHNwfK128VNoYQHF7Wd48OkhTOJOFReeV+SM+BG8gilVTK+W/asefXwrw7uci/y+CRNwxloj1xSLolFYUA13d0I2v+LnxOYqLy9poqNEgLVWzum2KaVZF3g7yUua6Hmc5vY7i/gS7OCVZ1brEBPyNz7xw6iqHHmwJNFEg0kAEPxVIQXj9Fs5KTMhkmgaWrQxwWKecppT0n6yBH8geck3UGXbQvNtzpkx7uQC6WvjcOop+J+gliONZOmUW/L/o9bvmTXd9ogCSpeiWSF3HxQ==",
  "previousEncryValue": "J4NqXLlxfW3AtdKm+Ee5lurnWp7ghjIMUECw49hlMPcYg1psdM6+e7rAX3Or16KL9Fv10e2u6ngOnzM5Ig3fK7UY6iMah7WQb1Wl3m9xmHovTEGLpeTsO1kCYn6FGFCuFZTf7cARAMiFQLj8IdCr6HUXMJUBerWsGOZuc3yoFyTklO43iHypNhtnhwRKHJcuA0RPs8kbsRpZF4sIysE6/Zovk2MYUULlljU4qazG1YK88vaKJsDlHS7XKuDR71rtL0hDO7j+kCnAQiUpMhFh/T7OWiGL9rS6XhgPhN8Jd4MNsHeL8evboidX9u05QmNAZ6ikqqSlk2CH2I4yVoHLoQ==",
  "transaction": {
    "doorId": "oWf+ergysdvfccHCy6Ztzyn7lha5prOBH8Sz/Dkg9towb9EiJ2isXtwnkV7hmszzWWHUlF5V37jwqkpHdT6Dd6MI5QfWY7vF9KwumLxB+AkH4cpUb39fR379l5uS+PMVh3RzygSIlM6170gO+PDydxhtM2x0P3h7RV6DbFRDDR+mJWs6/QAmO+coJqE8nZbS50WOPXDokdu8SeP28Vc8/0N72MSrpvWMxJsy89T1guX2O7WIn+OS2FZynulNzRt3f1RKQCEF9RfmgAq2tQHyrPe7ufTrqOA0thg/1qBjmoqzIyYsOz3+KY0MXg6ORGQA3ByAIK2byKvlbLl0F6DdjA==",
    "accessKey": "m9cscqBHfFQ0aXvXrXYVDYpNkukD0lxVP/5ho9hUJh5meMlAt9cB0LaUk8bLo2ReY3Ojf7LkTFtyzWHJOZ/fLUVqg/wb2AlIUnItnyNM15INuu9zpqa+JJotkdu7wODvQWvY27eSjMwbJ9JTWYZ5433Hyl7LMdvFfUI9f2zMDjr5eENkmMRTVB2KXEAHF/Rm+ugTdyeyqx7sRhOBMzADsMXt3tl1gwoNC+fthvxWea1nI1VEzAssLy50jNXJ3TnasAyLQ4LZaN1MKrrqCQwn8ipqCPJ0Ue9NpNdIa9mqQbckxSTyNnaYWIcqaaKBZAI9iCJ8sRlquNxetxkIWdhYmQ==",
    "transactionKey": "MIIEogIBAAKCAQEAwq8NBrnV4o5MPnmcOR4Z5Nl0cmFTKzAkZ0Lj48Lnm9+oq40I"
  }
}
```

```text
-1
```

### GET http://localhost:65006/blockLog

- 출입키 블록체인 게이트웨이 모듈의 로그 기록을 반환한다.

```bash
[
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 IP 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 IP 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 IP 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 엔진 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 IP 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 IP 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 초기설정 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 키 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 참여 정보 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 블록 관리 모듈 초기화",
  "4/1/2022, 2:28:04 AM [Info] 200: 출입키 블록체인 트랜잭션 관리 모듈 초기화",
  ...
]
```
