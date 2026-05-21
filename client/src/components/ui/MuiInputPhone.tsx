"use client";

import React, { useEffect, useRef, useState } from "react";
import { AsYouType, CountryCode, getCountries as getPhoneCountries } from "libphonenumber-js";
import { useSafeUser } from "@/contexts/UserContext";
import StyledTextField from "@/components/ui/StyledTextField";
import { TextFieldProps } from "@mui/material";

interface MuiInputPhoneProps extends Omit<TextFieldProps, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountryCode?: CountryCode;
}

/**
 * MUI-based phone input with automatic formatting via libphonenumber-js.
 * Drop-in replacement for the antd-based InputPhone, using StyledTextField.
 */
export default function MuiInputPhone({
  value,
  onChange,
  defaultCountryCode,
  ...props
}: MuiInputPhoneProps) {
  const safeUser = useSafeUser();
  const [displayValue, setDisplayValue] = useState<string>("");
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (defaultCountryCode) {
      setCountryCode(defaultCountryCode);
      return;
    }
    if (safeUser?.user) {
      const code = getPhoneCountries().includes(
        safeUser.user.address?.country as CountryCode
      )
        ? (safeUser.user.address.country as CountryCode)
        : "US";
      setCountryCode(code);
    }
  }, [safeUser?.user, defaultCountryCode]);

  useEffect(() => {
    const formatted = new AsYouType(countryCode).input(value?.toString() ?? "");
    setDisplayValue(formatted);
  }, [value, countryCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    // Emit digits-only to parent
    onChange?.(input.replace(/\D/g, ""));

    typingTimeout.current = setTimeout(() => {
      const formatted = new AsYouType(countryCode).input(input);
      setDisplayValue(formatted);
    }, 300);
  };

  return (
    <StyledTextField
      {...props}
      value={displayValue}
      onChange={handleChange}
      slotProps={{ htmlInput: { maxLength: 20 } }}
    />
  );
}
