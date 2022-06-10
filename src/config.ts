import { TypedDataDomain } from "@ethersproject/abstract-signer"

export const eip712Domain: TypedDataDomain = {
  name: 'stays',
  version: '1',
  chainId: '77',
  verifyingContract: '0xC1A95DD6184C6A37A9Dd7b4b5E7DfBd5065C8Dd5'
}
