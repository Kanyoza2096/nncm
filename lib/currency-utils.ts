/**
 * Utility functions for currency formatting and conversion.
 * Default currency is Malawi Kwacha (MK).
 */

export const DEFAULT_CURRENCY = 'MK';

/**
 * Formats a number as a currency string.
 * @param amount The numerical amount to format.
 * @param currency The currency code (e.g., 'MK', 'MWK', 'USD').
 * @returns A formatted string.
 */
export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  const safeAmount = Number(amount) || 0;
  
  if (currency === 'MK' || currency === 'MWK') {
    const mkString = `MK ${safeAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    const usdEquivalent = safeAmount / 1750;
    const usdString = usdEquivalent.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${mkString} (~$${usdString})`;
  }
  
  if (currency === 'USD') {
    const usdString = safeAmount.toLocaleString(undefined, { 
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    const mkEquivalent = safeAmount * 1750;
    const mkString = `MK ${mkEquivalent.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
    return `${usdString} (~${mkString})`;
  }

  if (currency === 'EUR') {
    const eurString = safeAmount.toLocaleString(undefined, { 
      style: 'currency', 
      currency: 'EUR' 
    });
    const mkEquivalent = safeAmount * 1900;
    const mkString = `MK ${mkEquivalent.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    return `${eurString} (~${mkString})`;
  }

  if (currency === 'GBP') {
    const gbpString = safeAmount.toLocaleString(undefined, { 
      style: 'currency', 
      currency: 'GBP' 
    });
    const mkEquivalent = safeAmount * 2200;
    const mkString = `MK ${mkEquivalent.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    return `${gbpString} (~${mkString})`;
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(safeAmount);
  } catch (e) {
    // Fallback for custom or unsupported currencies
    return `${currency} ${safeAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
};

/**
 * Simple mock conversion rate for display purposes if needed.
 * In a real app, this should fetch from an API.
 */
export const CONVERSION_RATES: Record<string, number> = {
  'USD': 1750, // 1 USD = 1750 MK (approximate/mock)
  'MK': 1,
  'MWK': 1
};

export const convertToMK = (amount: number, fromCurrency: string): number => {
  const rate = CONVERSION_RATES[fromCurrency] || 1;
  return amount * rate;
};
