import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const signupSchema = z
  .object({
    full_name: z.string().trim().min(3, "Full name must be at least 3 characters").max(50, "Full name must be at most 50 characters").regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Full name must contain only letters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[@#$%^&*!]/, "Must contain special character (@#$%^&*!)")
      .regex(/^[^\s]*$/, "Must not contain spaces"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords must match",
    path: ["password_confirmation"],
  });

export const otpVerificationSchema = z.object({
  otp_code: z.string().regex(/^[0-9]{6}$/, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[@#$%^&*!]/, "Must contain special character (@#$%^&*!)")
      .regex(/^[^\s]*$/, "Must not contain spaces"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords must match",
    path: ["password_confirmation"],
  });

export type SignupFormType = z.infer<typeof signupSchema>;
export type OTPVerificationType = z.infer<typeof otpVerificationSchema>;
export type LoginFormType = z.infer<typeof loginSchema>;
export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;

export const businessSetupSchema = z.object({
  shop_name: z.string().trim().min(3, "Shop name must be at least 3 characters").max(50, "Shop name must be at most 50 characters").regex(/[a-zA-Z]/, "Shop name must contain at least one letter"),
  phone_number: z.string().refine((val) => val && isValidPhoneNumber(val), "Enter a valid phone number"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address must be at most 200 characters").regex(/[a-zA-Z0-9]/, "Address must contain at least one letter or number"),
  upi_id: z.string().regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID (e.g., name@bank)").max(100, "UPI ID is too long"),
  business_type: z.enum(["restaurant", "cafe", "bakery", "retail", "shop", "other"], {
    errorMap: () => ({ message: "Please select a valid business type" })
  }),
  custom_business_type: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.business_type === "other" && (!data.custom_business_type || data.custom_business_type.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter your business type",
      path: ["custom_business_type"],
    });
  }
});

export type BusinessSetupFormType = z.infer<typeof businessSetupSchema>;

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(80, "Product name must be at most 80 characters").regex(/[a-zA-Z]/, "Product name must contain at least one letter"),
  category: z.string().trim().min(2, "Category must be at least 2 characters").max(40, "Category must be at most 40 characters").regex(/^[a-zA-Z0-9\s&,.'-]+$/, "Category contains invalid characters").regex(/[a-zA-Z0-9]/, "Category must contain at least one letter or number"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  quantity: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }, z.number({ required_error: "Quantity is required", invalid_type_error: "Enter a valid number" }).int("Quantity must be a whole number").min(0, "Quantity cannot be negative").max(99999, "Quantity cannot exceed 99,999")),
  price: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }, z.number({ required_error: "Price is required", invalid_type_error: "Enter a valid price" }).min(0, "Price cannot be negative").max(999999, "Price cannot exceed 9,99,999")),
  discount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined || Number.isNaN(val)) return 0;
    return Number(val);
  }, z.number().min(0, "Discount cannot be negative").max(999999, "Discount value is too large")),
  currency: z.string().min(1, "Currency is required").default("INR"),
}).refine(data => data.discount <= data.price, {
  message: "Discount cannot be greater than price",
  path: ["discount"],
});

export type MenuItemFormType = z.infer<typeof menuItemSchema>;

export const profileDetailsSchema = z.object({
  full_name: z.string().trim().min(3, "Full name must be at least 3 characters").regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Full name must contain only letters"),
  shop_name: z.string().trim().min(3, "Shop name must be at least 3 characters").max(50, "Shop name must be at most 50 characters").regex(/[a-zA-Z]/, "Shop name must contain at least one letter"),
  phone_number: z.string().refine((val) => val && isValidPhoneNumber(val), "Enter a valid phone number"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address must be at most 200 characters").regex(/[a-zA-Z0-9]/, "Address must contain at least one letter or number"),
});

export type ProfileDetailsFormType = z.infer<typeof profileDetailsSchema>;

export const profilePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[@#$%^&*!]/, "Must contain special character (@#$%^&*!)")
      .regex(/^[^\s]*$/, "Must not contain spaces"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords must match",
    path: ["password_confirmation"],
  });

export type ProfilePasswordFormType = z.infer<typeof profilePasswordSchema>;
