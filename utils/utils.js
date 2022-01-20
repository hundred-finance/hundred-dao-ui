import BigNumber from "bignumber.js";
import moment from 'moment';

// todo: get navigator declared somehow? probably an issue with using nextjs
// function getLang() {
//  if (window.navigator.languages != undefined)
//   return window.navigator.languages[0];
//  else
//   return window.navigator.language;
// }

export function formatCurrency(amount, decimals = 2) {
  if (!isNaN(amount)) {
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return formatter.format(amount);
  } else {
    return 0;
  }
}

export function formatAddress(address, length = "short") {
  if (address && length === "short") {
    address =
      address.substring(0, 6) +
      "..." +
      address.substring(address.length - 4, address.length);
    return address;
  } else if (address && length === "long") {
    address =
      address.substring(0, 12) +
      "..." +
      address.substring(address.length - 8, address.length);
    return address;
  } else {
    return null;
  }
}

export function bnDec(decimals) {
  return new BigNumber(10).pow(parseInt(decimals));
}

export function sqrt(value) {
  if (value < 0n) {
    throw new Error('square root of negative numbers is not supported')
  }

  if (value < 2n) {
    return value
  }

  function newtonIteration(n, x0) {
    // eslint-disable-next-line no-bitwise
    const x1 = (n / x0 + x0) >> 1n
    if (x0 === x1 || x0 === x1 - 1n) {
      return x0
    }
    return newtonIteration(n, x1)
  }

  return newtonIteration(value, 1n)
}


export function normalizeDate(inputDate) {
  const week = 7 * 24 * 3600;
  let normalizeTimestamp = Math.floor(moment(inputDate).unix() / week ) * week + week;
  const maxTimestamp = moment().unix() + 4 * 365 * 24 * 3600;
  while (normalizeTimestamp > maxTimestamp) {
    normalizeTimestamp -= week;
  }
  return moment.unix(normalizeTimestamp).format("YYYY-MM-DD");
}