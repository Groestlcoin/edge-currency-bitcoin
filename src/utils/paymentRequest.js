// @flow
import bcoin from 'bcoin'
import parse from 'url-parse'
// $FlowFixMe
import type { EdgePaymentProtocolInfo } from 'edge-core-js'
import { toNewFormat } from './addressFormat/addressFormatIndex.js'

// $FlowFixMe
export const parsePayment = (
  paymentBuffer: Buffer,
  network: string,
  currencyCode: string
): EdgePaymentProtocolInfo => {
  const bip70 = bcoin.bip70.PaymentRequest.fromRaw(paymentBuffer)
  const {
    paymentUrl = '',
    memo,
    merchantData,
    outputs = []
  } = bip70.paymentDetails
  const domain = parse(paymentUrl, {}).hostname
  const spendTargets = []
  let nativeAmount = 0

  for (const output of outputs) {
    const jsonObj = output.getJSON(network)
    nativeAmount += jsonObj.value
    spendTargets.push({
      currencyCode: currencyCode,
      publicAddress: toNewFormat(jsonObj.address, network),
      nativeAmount: `${jsonObj.value}`
    })
  }

  const edgePaymentProtocolInfo = {
    nativeAmount: `${nativeAmount}`,
    merchant: merchantData || '',
    memo: memo || '',
    domain,
    spendTargets
  }

  return edgePaymentProtocolInfo
}
